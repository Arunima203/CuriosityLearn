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


@router.post("", response_model=StudentProfileResponse)
def create_or_update_profile(
    data: StudentProfileCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """Create profile if it doesn't exist, otherwise update it."""
    user_id = get_current_user_id(credentials)

    existing = (
        db.query(StudentProfile)
        .filter(StudentProfile.user_id == user_id)
        .first()
    )

    if existing:
        existing.class_name = data.class_name
        existing.board = data.board
        existing.medium = data.medium
        db.commit()
        db.refresh(existing)
        return existing

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


@router.put("", response_model=StudentProfileResponse)
def update_profile(
    data: StudentProfileCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """Explicitly update an existing profile."""
    user_id = get_current_user_id(credentials)

    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.user_id == user_id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please create one first.",
        )

    profile.class_name = data.class_name
    profile.board = data.board
    profile.medium = data.medium
    db.commit()
    db.refresh(profile)
    return profile


@router.get("", response_model=StudentProfileResponse)
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
