
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import StudentProfile
from ..schemas.student_profile import (
    StudentProfileCreate,
    StudentProfileResponse,
)
from ..services.jwt import get_current_user_id, security


router = APIRouter(
    prefix="/student-profile",
    tags=["Student Profile"],
)


@router.post(
    "",
    response_model=StudentProfileResponse,
)
def create_profile(
    data: StudentProfileCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id(credentials)

    existing_profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.user_id == user_id)
        .first()
    )

    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists",
        )

    profile = StudentProfile(
        user_id=user_id,
        class_name=data.class_name,
        board=data.board,
        medium=data.medium,
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


@router.get(
    "",
    response_model=StudentProfileResponse,
)
def get_profile(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id(credentials)

    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.user_id == user_id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    return profile