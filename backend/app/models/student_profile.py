from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
    )

    class_name: Mapped[str] = mapped_column(String(20))
    board: Mapped[str] = mapped_column(String(50))
    medium: Mapped[str] = mapped_column(String(30))

    user = relationship("User", backref="student_profile")