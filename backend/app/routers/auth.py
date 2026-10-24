from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import HTTPAuthorizationCredentials

from ..database import get_db
from ..models import User
from ..schemas.auth import RegisterRequest, LoginRequest
from ..services.security import hash_password, verify_password
from ..services.jwt import create_access_token, get_current_user_id, security


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Teachers require admin verification & approval (is_approved=False)
    # Students are automatically approved (is_approved=True)
    is_teacher = data.role == "teacher"
    is_approved = False if is_teacher else True

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
        is_approved=is_approved,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    message = (
        "Teacher registration submitted! Please wait for Admin verification & approval before logging in. (আপনার শিক্ষক অ্যাকাউন্টটি অ্যাডমিন যাচাই করে অনুমোদন করবেন।)"
        if is_teacher
        else "User registered successfully"
    )

    return {
        "message": message,
        "is_approved": user.is_approved,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_approved": user.is_approved,
        },
    }


@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Check teacher verification/approval status
    if user.role == "teacher" and not user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your teacher account is pending verification and approval by the Admin. (আপনার শিক্ষক অ্যাকাউন্টটি এখনও অ্যাডমিন দ্বারা অনুমোদিত হয়নি। অনুগ্রহ করে অপেক্ষা করুন।)",
        )

    access_token = create_access_token(user.id)

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_approved": user.is_approved,
        },
    }


@router.get("/me")
def get_me(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id(credentials)

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "is_approved": user.is_approved,
    }
