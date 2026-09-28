from sqlalchemy import String, Text, Boolean, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class MockTest(Base):
    __tablename__ = "mock_tests"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    title: Mapped[str] = mapped_column(
        String(200)
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    week: Mapped[int] = mapped_column(
        Integer
    )

    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    published: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )


class MockQuestion(Base):
    __tablename__ = "mock_questions"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    test_id: Mapped[int] = mapped_column(
        ForeignKey("mock_tests.id")
    )

    question: Mapped[str] = mapped_column(
        Text
    )

    option_a: Mapped[str] = mapped_column(
        String(500)
    )

    option_b: Mapped[str] = mapped_column(
        String(500)
    )

    option_c: Mapped[str] = mapped_column(
        String(500)
    )

    option_d: Mapped[str] = mapped_column(
        String(500)
    )

    correct_answer: Mapped[int] = mapped_column(
        Integer
    )

    explanation: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )


class MockAttempt(Base):
    __tablename__ = "mock_attempts"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    test_id: Mapped[int] = mapped_column(
        ForeignKey("mock_tests.id")
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    score: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    total_questions: Mapped[int] = mapped_column(
        Integer,
        default=0
    )


class MockAnswer(Base):
    __tablename__ = "mock_answers"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    attempt_id: Mapped[int] = mapped_column(
        ForeignKey("mock_attempts.id")
    )

    question_id: Mapped[int] = mapped_column(
        ForeignKey("mock_questions.id")
    )

    selected_answer: Mapped[int] = mapped_column(
        Integer
    )

    is_correct: Mapped[bool] = mapped_column(
        Boolean
    )