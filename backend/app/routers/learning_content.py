from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..models.learning_content import LearningContent
from ..services.jwt import get_current_user_id, security

router = APIRouter(prefix="/learning-content", tags=["Learning Content"])


# ── Schemas ───────────────────────────────────────────────────────────────

class LearningContentCreate(BaseModel):
    subject: str = "Geography"
    chapter: str
    title: str
    description: str | None = None
    video_url: str | None = None
    image_url: str | None = None
    notes: str | None = None
    explanation: str | None = None


class LearningContentUpdate(BaseModel):
    subject: str | None = None
    chapter: str | None = None
    title: str | None = None
    description: str | None = None
    video_url: str | None = None
    image_url: str | None = None
    notes: str | None = None
    explanation: str | None = None


# ── Helpers ───────────────────────────────────────────────────────────────

def require_teacher(credentials: HTTPAuthorizationCredentials, db: Session) -> User:
    user_id = get_current_user_id(credentials)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can manage Learning content")
    return user


def content_response(item: LearningContent) -> dict:
    return {
        "id": item.id,
        "teacher_id": item.teacher_id,
        "subject": item.subject,
        "chapter": item.chapter,
        "title": item.title,
        "description": item.description,
        "video_url": item.video_url,
        "image_url": item.image_url,
        "notes": item.notes,
        "explanation": item.explanation,
        "created_at": item.created_at.isoformat() if item.created_at else None,
    }


# ── GET all (public) ──────────────────────────────────────────────────────

@router.get("/")
def list_learning_content(db: Session = Depends(get_db)):
    items = (
        db.query(LearningContent)
        .order_by(LearningContent.created_at.desc())
        .all()
    )
    return [content_response(item) for item in items]


# ── CREATE (teacher only) ─────────────────────────────────────────────────

@router.post("/")
def create_learning_content(
    payload: LearningContentCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    teacher = require_teacher(credentials, db)

    chapter = (payload.chapter or "").strip()
    title = (payload.title or "").strip()
    subject = (payload.subject or "Geography").strip()

    if not chapter or not title:
        raise HTTPException(status_code=422, detail="Chapter and title are required")

    item = LearningContent(
        teacher_id=teacher.id,
        subject=subject,
        chapter=chapter,
        title=title,
        description=payload.description,
        video_url=payload.video_url,
        image_url=payload.image_url,
        notes=payload.notes,
        explanation=payload.explanation,
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return content_response(item)


# ── UPDATE (teacher only, own lesson) ────────────────────────────────────

@router.put("/{content_id}")
def update_learning_content(
    content_id: int,
    payload: LearningContentUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    teacher = require_teacher(credentials, db)

    item = db.query(LearningContent).filter(LearningContent.id == content_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Learning content not found")
    if item.teacher_id != teacher.id:
        raise HTTPException(status_code=403, detail="You can only edit your own Learning content")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)

    return content_response(item)


# ── DELETE (teacher only, own lesson) ────────────────────────────────────

@router.delete("/{content_id}")
def delete_learning_content(
    content_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    teacher = require_teacher(credentials, db)

    item = db.query(LearningContent).filter(LearningContent.id == content_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Learning content not found")
    if item.teacher_id != teacher.id:
        raise HTTPException(status_code=403, detail="You can only delete your own Learning content")

    db.delete(item)
    db.commit()

    return {"message": "Learning content deleted successfully"}
