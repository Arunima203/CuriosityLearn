import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..models.student_profile import StudentProfile
from ..models.curiosity import CuriosityAnswer
from ..models.mock_test import MockAttempt, MockTest
from ..models.activity import StudentActivity
from ..services.jwt import get_current_user_id, security


# --------------------------------------------------
# Routers
# --------------------------------------------------

student_router = APIRouter(
    tags=["Student Activity"],
)

teacher_router = APIRouter(
    prefix="/teacher",
    tags=["Teacher Progress"],
)


# --------------------------------------------------
# Request schema
# --------------------------------------------------

class StudentActivityCreate(BaseModel):
    activity_type: str = Field(
        ...,
        min_length=2,
        max_length=50,
    )

    title: str = Field(
        ...,
        min_length=2,
        max_length=255,
    )

    score: int | None = None

    details: dict | str | None = None


# --------------------------------------------------
# Helpers
# --------------------------------------------------

def get_user_or_404(
    db: Session,
    user_id: int,
) -> User:

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

    return user


def require_teacher(
    credentials: HTTPAuthorizationCredentials,
    db: Session,
) -> User:

    user_id = get_current_user_id(credentials)

    user = get_user_or_404(
        db,
        user_id,
    )

    if user.role != "teacher":
        raise HTTPException(
            status_code=403,
            detail="Teacher access required",
        )

    return user


def activity_to_dict(
    activity: StudentActivity,
):

    details = activity.details

    if details:

        try:
            details = json.loads(details)

        except (TypeError, ValueError):
            pass

    return {
        "id": activity.id,
        "activity_type": activity.activity_type,
        "title": activity.title,
        "score": activity.score,
        "details": details,
        "created_at": (
            activity.created_at.isoformat()
            if activity.created_at
            else None
        ),
    }


# --------------------------------------------------
# Student: Save activity
# --------------------------------------------------

@student_router.post("/student/activity")
def create_student_activity(
    data: StudentActivityCreate,

    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),

    db: Session = Depends(get_db),
):

    user_id = get_current_user_id(
        credentials
    )

    user = get_user_or_404(
        db,
        user_id,
    )

    if user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required",
        )

    if isinstance(data.details, dict):

        details = json.dumps(
            data.details,
            ensure_ascii=False,
        )

    else:

        details = data.details

    activity = StudentActivity(
        user_id=user_id,
        activity_type=data.activity_type.strip(),
        title=data.title.strip(),
        score=data.score,
        details=details,
    )

    db.add(activity)

    db.commit()

    db.refresh(activity)

    return {
        "message": "Activity recorded successfully",
        "activity": activity_to_dict(
            activity
        ),
    }


# --------------------------------------------------
# Student: Get own activity
# --------------------------------------------------

@student_router.get("/student/activity")
def get_student_activity(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),

    db: Session = Depends(get_db),
):

    user_id = get_current_user_id(
        credentials
    )

    user = get_user_or_404(
        db,
        user_id,
    )

    if user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required",
        )

    activities = (
        db.query(StudentActivity)
        .filter(
            StudentActivity.user_id == user_id
        )
        .order_by(
            StudentActivity.created_at.desc()
        )
        .limit(50)
        .all()
    )

    return [
        activity_to_dict(activity)
        for activity in activities
    ]


# --------------------------------------------------
# Teacher: Build student summary
# --------------------------------------------------

def build_student_summary(
    db: Session,
    student: User,
):

    profile = (
        db.query(StudentProfile)
        .filter(
            StudentProfile.user_id
            == student.id
        )
        .first()
    )

    # ------------------------------
    # Curiosity
    # ------------------------------

    curiosity_total = (
        db.query(
            func.count(CuriosityAnswer.id)
        )
        .filter(
            CuriosityAnswer.user_id
            == student.id
        )
        .scalar()
        or 0
    )

    curiosity_correct = (
        db.query(
            func.count(CuriosityAnswer.id)
        )
        .filter(
            CuriosityAnswer.user_id
            == student.id,

            CuriosityAnswer.is_correct.is_(True),
        )
        .scalar()
        or 0
    )

    curiosity_xp = (
        db.query(
            func.coalesce(
                func.sum(
                    CuriosityAnswer.xp_earned
                ),
                0,
            )
        )
        .filter(
            CuriosityAnswer.user_id
            == student.id
        )
        .scalar()
        or 0
    )

    curiosity_accuracy = 0

    if curiosity_total:

        curiosity_accuracy = round(
            (
                curiosity_correct
                / curiosity_total
            )
            * 100,
            2,
        )

    # ------------------------------
    # Mock tests
    # ------------------------------

    mock_attempts = (
        db.query(
            func.count(MockAttempt.id)
        )
        .filter(
            MockAttempt.student_id
            == student.id
        )
        .scalar()
        or 0
    )

    mock_score = (
        db.query(
            func.coalesce(
                func.sum(
                    MockAttempt.score
                ),
                0,
            )
        )
        .filter(
            MockAttempt.student_id
            == student.id
        )
        .scalar()
        or 0
    )

    mock_total_questions = (
        db.query(
            func.coalesce(
                func.sum(
                    MockAttempt.total_questions
                ),
                0,
            )
        )
        .filter(
            MockAttempt.student_id
            == student.id
        )
        .scalar()
        or 0
    )

    mock_average_percentage = 0

    if mock_total_questions:

        mock_average_percentage = round(
            (
                mock_score
                / mock_total_questions
            )
            * 100,
            2,
        )

    # ------------------------------
    # General activity
    # ------------------------------

    activity_count = (
        db.query(
            func.count(
                StudentActivity.id
            )
        )
        .filter(
            StudentActivity.user_id
            == student.id
        )
        .scalar()
        or 0
    )

    last_activity = (
        db.query(
            func.max(
                StudentActivity.created_at
            )
        )
        .filter(
            StudentActivity.user_id
            == student.id
        )
        .scalar()
    )

    return {
        "id": student.id,
        "name": student.name,
        "email": student.email,
        "role": student.role,

        "profile": (
            {
                "class_name": profile.class_name,
                "board": profile.board,
                "medium": profile.medium,
            }
            if profile
            else None
        ),

        "progress": {
            "curiosity_answered": int(
                curiosity_total
            ),

            "curiosity_correct": int(
                curiosity_correct
            ),

            "curiosity_accuracy": curiosity_accuracy,

            "curiosity_xp": int(
                curiosity_xp
            ),

            "mock_attempts": int(
                mock_attempts
            ),

            "mock_average_percentage": (
                mock_average_percentage
            ),

            "activity_count": int(
                activity_count
            ),
        },

        "last_activity_at": (
            last_activity.isoformat()
            if last_activity
            else None
        ),
    }


# --------------------------------------------------
# Teacher: Get all students
# --------------------------------------------------

@teacher_router.get("/students")
def get_students_for_teacher(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),

    db: Session = Depends(get_db),
):

    require_teacher(
        credentials,
        db,
    )

    students = (
        db.query(User)
        .filter(
            User.role == "student"
        )
        .order_by(
            User.name.asc(),
            User.id.asc(),
        )
        .all()
    )

    return [
        build_student_summary(
            db,
            student,
        )
        for student in students
    ]


# --------------------------------------------------
# Teacher: Get one student's details
# --------------------------------------------------

@teacher_router.get(
    "/students/{student_id}"
)
def get_student_progress_for_teacher(
    student_id: int,

    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),

    db: Session = Depends(get_db),
):

    require_teacher(
        credentials,
        db,
    )

    student = (
        db.query(User)
        .filter(
            User.id == student_id,
            User.role == "student",
        )
        .first()
    )

    if not student:

        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    summary = build_student_summary(
        db,
        student,
    )

    # ------------------------------
    # Recent activities
    # ------------------------------

    activities = (
        db.query(StudentActivity)
        .filter(
            StudentActivity.user_id
            == student_id
        )
        .order_by(
            StudentActivity.created_at.desc()
        )
        .limit(20)
        .all()
    )

    # ------------------------------
    # Curiosity history
    # ------------------------------

    curiosity_history = (
        db.query(CuriosityAnswer)
        .filter(
            CuriosityAnswer.user_id
            == student_id
        )
        .order_by(
            CuriosityAnswer.answered_at.desc()
        )
        .limit(20)
        .all()
    )

    # ------------------------------
    # Mock history
    # ------------------------------

    mock_history = (
        db.query(MockAttempt)
        .filter(
            MockAttempt.student_id
            == student_id
        )
        .order_by(
            MockAttempt.id.desc()
        )
        .limit(20)
        .all()
    )

    test_ids = [
        attempt.test_id
        for attempt in mock_history
    ]

    test_map = {}

    if test_ids:

        tests = (
            db.query(MockTest)
            .filter(
                MockTest.id.in_(test_ids)
            )
            .all()
        )

        test_map = {
            test.id: test.title
            for test in tests
        }

    summary["recent_activities"] = [
        activity_to_dict(
            activity
        )
        for activity in activities
    ]

    summary["curiosity_history"] = [
        {
            "id": item.id,
            "question_id": item.question_id,
            "selected_answer": (
                item.selected_answer
            ),
            "is_correct": item.is_correct,
            "xp_earned": item.xp_earned,
            "answered_at": (
                item.answered_at.isoformat()
                if item.answered_at
                else None
            ),
        }
        for item in curiosity_history
    ]

    summary["mock_history"] = [
        {
            "id": attempt.id,
            "test_id": attempt.test_id,
            "test_title": test_map.get(
                attempt.test_id,
                f"Mock Test #{attempt.test_id}",
            ),
            "score": attempt.score,
            "total_questions": (
                attempt.total_questions
            ),
            "percentage": (
                round(
                    (
                        attempt.score
                        / attempt.total_questions
                    )
                    * 100,
                    2,
                )
                if attempt.total_questions
                else 0
            ),
        }
        for attempt in mock_history
    ]

    return summary