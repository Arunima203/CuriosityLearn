from datetime import date, datetime

from sqlalchemy import String, Text, Integer, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class CuriosityQuestion(Base):
    __tablename__ = "curiosity_questions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    question: Mapped[str] = mapped_column(Text, nullable=False)

    category: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    option_a: Mapped[str] = mapped_column(String(255), nullable=False)
    option_b: Mapped[str] = mapped_column(String(255), nullable=False)
    option_c: Mapped[str] = mapped_column(String(255), nullable=False)
    option_d: Mapped[str] = mapped_column(String(255), nullable=False)

    correct_answer: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    explanation: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    question_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    city: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    region: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    country: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )


class CuriosityAnswer(Base):
    __tablename__ = "curiosity_answers"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    question_id: Mapped[int] = mapped_column(
        ForeignKey("curiosity_questions.id"),
        nullable=False,
        index=True,
    )

    selected_answer: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    is_correct: Mapped[bool] = mapped_column(
        nullable=False,
    )

    xp_earned: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    answered_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )