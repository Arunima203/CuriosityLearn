from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class GeographyContent(Base):
    __tablename__ = "geography_contents"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    teacher_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    subject: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="Geography",
    )

    chapter: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    image_filename: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    image_original_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )