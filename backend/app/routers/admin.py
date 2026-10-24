from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..services.jwt import get_current_user_id, security

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


def require_admin_or_teacher(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    user_id = get_current_user_id(credentials)
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.role not in ["admin", "teacher"] or (user.role == "teacher" and not user.is_approved):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or approved teacher access required",
        )

    return user


@router.get("/teachers")
def get_teachers(
    admin: User = Depends(require_admin_or_teacher),
    db: Session = Depends(get_db),
):
    """Get all teachers split into pending and approved."""
    pending = (
        db.query(User)
        .filter(User.role == "teacher", User.is_approved == False)
        .order_by(User.id.desc())
        .all()
    )

    approved = (
        db.query(User)
        .filter(User.role == "teacher", User.is_approved == True)
        .order_by(User.id.desc())
        .all()
    )

    return {
        "pending": [
            {
                "id": t.id,
                "name": t.name,
                "email": t.email,
                "role": t.role,
                "is_approved": t.is_approved,
            }
            for t in pending
        ],
        "approved": [
            {
                "id": t.id,
                "name": t.name,
                "email": t.email,
                "role": t.role,
                "is_approved": t.is_approved,
            }
            for t in approved
        ],
        "pending_count": len(pending),
        "approved_count": len(approved),
    }


@router.post("/teachers/{teacher_id}/approve")
def approve_teacher(
    teacher_id: int,
    admin: User = Depends(require_admin_or_teacher),
    db: Session = Depends(get_db),
):
    """Approve a registered teacher."""
    teacher = (
        db.query(User)
        .filter(User.id == teacher_id, User.role == "teacher")
        .first()
    )

    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found",
        )

    teacher.is_approved = True
    db.commit()
    db.refresh(teacher)

    return {
        "message": f"Teacher '{teacher.name}' ({teacher.email}) has been approved successfully! ✅",
        "teacher": {
            "id": teacher.id,
            "name": teacher.name,
            "email": teacher.email,
            "role": teacher.role,
            "is_approved": teacher.is_approved,
        },
    }


@router.post("/teachers/{teacher_id}/reject")
def reject_teacher(
    teacher_id: int,
    admin: User = Depends(require_admin_or_teacher),
    db: Session = Depends(get_db),
):
    """Reject and delete a pending teacher registration."""
    teacher = (
        db.query(User)
        .filter(User.id == teacher_id, User.role == "teacher")
        .first()
    )

    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found",
        )

    name = teacher.name
    email = teacher.email
    db.delete(teacher)
    db.commit()

    return {
        "message": f"Teacher registration for '{name}' ({email}) was rejected and removed.",
    }


@router.post("/teachers/{teacher_id}/revoke")
def revoke_teacher(
    teacher_id: int,
    admin: User = Depends(require_admin_or_teacher),
    db: Session = Depends(get_db),
):
    """Revoke teacher approval."""
    teacher = (
        db.query(User)
        .filter(User.id == teacher_id, User.role == "teacher")
        .first()
    )

    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found",
        )

    teacher.is_approved = False
    db.commit()
    db.refresh(teacher)

    return {
        "message": f"Approval for '{teacher.name}' has been revoked.",
    }
