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
from ..models import GeographyContent, User
from ..services.jwt import get_current_user_id, security


router = APIRouter(
    prefix="/geography-content",
    tags=["Geography Content"],
)


# ---------------------------------------------------------
# Geography image upload folder
# ---------------------------------------------------------

UPLOAD_DIR = (
    Path(__file__).resolve().parents[2]
    / "uploads"
    / "geography"
)

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ---------------------------------------------------------
# Allowed image types
# ---------------------------------------------------------

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}

MAX_IMAGE_SIZE = 8 * 1024 * 1024


# ---------------------------------------------------------
# Teacher-only access
# ---------------------------------------------------------

def require_teacher(
    credentials: HTTPAuthorizationCredentials,
    db: Session,
) -> User:

    user_id = get_current_user_id(credentials)

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if user.role != "teacher":
        raise HTTPException(
            status_code=403,
            detail="Only teachers can manage Geography images",
        )

    return user


# ---------------------------------------------------------
# Response formatter
# ---------------------------------------------------------

def content_response(item: GeographyContent):

    image_url = (
        f"/geography-content/images/{item.image_filename}"
        if item.image_filename
        else None
    )

    return {
        "id": item.id,
        "subject": item.subject,
        "chapter": item.chapter,
        "title": item.title,
        "description": item.description,
        "image_url": image_url,
        "created_at": (
            item.created_at.isoformat()
            if item.created_at
            else None
        ),
    }


# ---------------------------------------------------------
# GET all Geography content
# ---------------------------------------------------------

@router.get("/")
def list_geography_content(
    db: Session = Depends(get_db),
):

    items = (
        db.query(GeographyContent)
        .order_by(
            GeographyContent.created_at.desc()
        )
        .all()
    )

    return [
        content_response(item)
        for item in items
    ]


# ---------------------------------------------------------
# GET Geography image
# ---------------------------------------------------------

@router.get("/images/{filename}")
def get_geography_image(
    filename: str,
):

    # Prevent path traversal
    safe_name = Path(filename).name

    file_path = UPLOAD_DIR / safe_name

    if not file_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Image not found",
        )

    return FileResponse(file_path)


# ---------------------------------------------------------
# CREATE Geography content
# Teacher only
# ---------------------------------------------------------

@router.post("/")
async def create_geography_content(
    chapter: str = Form(...),
    title: str = Form(...),
    description: str = Form(""),
    subject: str = Form("Geography"),
    image: UploadFile | None = File(None),

    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),

    db: Session = Depends(get_db),
):

    # Teacher verification
    teacher = require_teacher(
        credentials,
        db,
    )

    chapter = chapter.strip()
    title = title.strip()
    subject = subject.strip() or "Geography"
    description = description.strip()

    # Required fields
    if not chapter or not title:
        raise HTTPException(
            status_code=422,
            detail="Chapter and topic title are required",
        )

    image_filename = None
    image_original_name = None

    # -----------------------------------------------------
    # Image validation + save
    # -----------------------------------------------------

    if image and image.filename:

        if image.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Only JPG, PNG, WEBP or GIF "
                    "images are allowed"
                ),
            )

        data = await image.read()

        if len(data) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="Image must be 8 MB or smaller",
            )

        suffix = Path(
            image.filename
        ).suffix.lower()

        image_filename = (
            f"{uuid4().hex}{suffix}"
        )

        image_original_name = (
            Path(image.filename).name
        )

        image_path = (
            UPLOAD_DIR / image_filename
        )

        image_path.write_bytes(data)

    # -----------------------------------------------------
    # Database record
    # -----------------------------------------------------

    item = GeographyContent(
        teacher_id=teacher.id,
        subject=subject,
        chapter=chapter,
        title=title,
        description=(
            description
            if description
            else None
        ),
        image_filename=image_filename,
        image_original_name=image_original_name,
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return content_response(item)


# ---------------------------------------------------------
# DELETE Geography content
# Teacher can delete own content only
# ---------------------------------------------------------

@router.delete("/{content_id}")
def delete_geography_content(
    content_id: int,

    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),

    db: Session = Depends(get_db),
):

    teacher = require_teacher(
        credentials,
        db,
    )

    item = (
        db.query(GeographyContent)
        .filter(
            GeographyContent.id == content_id
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Geography content not found",
        )

    # Teacher can delete only own content
    if item.teacher_id != teacher.id:
        raise HTTPException(
            status_code=403,
            detail=(
                "You can delete only your own "
                "Geography content"
            ),
        )

    # Delete image file
    if item.image_filename:

        image_path = (
            UPLOAD_DIR
            / Path(item.image_filename).name
        )

        if image_path.is_file():
            image_path.unlink()

    # Delete database record
    db.delete(item)
    db.commit()

    return {
        "message": (
            "Geography content deleted successfully"
        )
    }