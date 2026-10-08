from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from fastapi.responses import FileResponse
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.knowledge_item import KnowledgeItem
from ..models.user import User
from ..services.jwt import get_current_user_id, security


router = APIRouter(
    prefix="/knowledge-center",
    tags=["Knowledge Center"],
)


BASE_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BASE_DIR / "uploads" / "knowledge"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}

MAX_IMAGE_SIZE = 8 * 1024 * 1024


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    user_id = get_current_user_id(credentials)

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    return user


def require_teacher(
    user: User = Depends(get_current_user),
) -> User:
    if user.role != "teacher":
        raise HTTPException(
            status_code=403,
            detail="Only teachers can manage Knowledge Center content.",
        )

    return user


def serialize_item(item: KnowledgeItem) -> dict:
    return {
        "id": item.id,
        "teacher_id": item.teacher_id,
        "subject": item.subject,
        "category": item.category,
        "title": item.title,
        "content": item.content,
        "image_url": (
            f"/knowledge-center/images/{item.image_filename}"
            if item.image_filename
            else None
        ),
        "image_original_name": item.image_original_name,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
    }


async def save_image(image: UploadFile | None) -> tuple[str | None, str | None]:
    if not image or not image.filename:
        return None, None

    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, WEBP and GIF images are allowed.",
        )

    data = await image.read()

    if len(data) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Image size must be 8 MB or less.",
        )

    extension = Path(image.filename).suffix.lower()

    if not extension:
        extension = ".jpg"

    filename = f"{uuid4().hex}{extension}"

    file_path = UPLOAD_DIR / filename

    file_path.write_bytes(data)

    return filename, image.filename


def delete_image(filename: str | None) -> None:
    if not filename:
        return

    file_path = UPLOAD_DIR / filename

    try:
        if file_path.exists():
            file_path.unlink()
    except OSError:
        pass


@router.get("/")
def list_knowledge_items(
    db: Session = Depends(get_db),
):
    items = (
        db.query(KnowledgeItem)
        .order_by(KnowledgeItem.created_at.desc())
        .all()
    )

    return {
        "items": [serialize_item(item) for item in items],
    }


@router.get("/images/{filename}")
def get_knowledge_image(filename: str):
    safe_name = Path(filename).name
    file_path = UPLOAD_DIR / safe_name

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Image not found.",
        )

    return FileResponse(file_path)


@router.post("/")
async def create_knowledge_item(
    subject: str = Form(...),
    category: str = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    image: UploadFile | None = File(None),
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    subject = subject.strip()
    category = category.strip()
    title = title.strip()
    content = content.strip()

    if not subject:
        raise HTTPException(
            status_code=400,
            detail="Subject is required.",
        )

    if not category:
        raise HTTPException(
            status_code=400,
            detail="Category is required.",
        )

    if not title:
        raise HTTPException(
            status_code=400,
            detail="Title is required.",
        )

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Content is required.",
        )

    image_filename, image_original_name = await save_image(image)

    item = KnowledgeItem(
        teacher_id=teacher.id,
        subject=subject,
        category=category,
        title=title,
        content=content,
        image_filename=image_filename,
        image_original_name=image_original_name,
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return serialize_item(item)


@router.put("/{item_id}")
async def update_knowledge_item(
    item_id: int,
    subject: str = Form(...),
    category: str = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    image: UploadFile | None = File(None),
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    item = (
        db.query(KnowledgeItem)
        .filter(KnowledgeItem.id == item_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Knowledge item not found.",
        )

    if item.teacher_id != teacher.id:
        raise HTTPException(
            status_code=403,
            detail="You can only edit your own content.",
        )

    subject = subject.strip()
    category = category.strip()
    title = title.strip()
    content = content.strip()

    if not subject or not category or not title or not content:
        raise HTTPException(
            status_code=400,
            detail="Subject, category, title and content are required.",
        )

    item.subject = subject
    item.category = category
    item.title = title
    item.content = content

    if image and image.filename:
        old_image = item.image_filename

        image_filename, image_original_name = await save_image(image)

        item.image_filename = image_filename
        item.image_original_name = image_original_name

        delete_image(old_image)

    db.commit()
    db.refresh(item)

    return serialize_item(item)


@router.delete("/{item_id}")
def delete_knowledge_item(
    item_id: int,
    teacher: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    item = (
        db.query(KnowledgeItem)
        .filter(KnowledgeItem.id == item_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Knowledge item not found.",
        )

    if item.teacher_id != teacher.id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own content.",
        )

    delete_image(item.image_filename)

    db.delete(item)
    db.commit()

    return {
        "message": "Knowledge item deleted successfully.",
        "id": item_id,
    }