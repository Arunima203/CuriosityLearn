from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class ChapterQuizQuestion(Base):
    __tablename__ = "chapter_quiz_questions"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    chapter: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
    )

    question: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    option_a: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    option_b: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    option_c: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    option_d: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    correct_answer: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    explanation: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
