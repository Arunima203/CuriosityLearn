from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..models.mock_test import (
    MockTest,
    MockQuestion,
    MockAttempt,
    MockAnswer,
)
from ..schemas.mock_test import (
    CreateTestRequest,
    CreateQuestionRequest,
    SubmitTestRequest,
)
from ..services.jwt import get_current_user_id, security


router = APIRouter(
    prefix="/mock-tests",
    tags=["Mock Tests"],
)


def get_current_user(
    credentials=Depends(security),
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id(credentials)

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# --------------------------------
# TEACHER - CREATE TEST
# --------------------------------

@router.post("/teacher/create")
def create_test(
    data: CreateTestRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):

    if user.role != "teacher":
        raise HTTPException(
            status_code=403,
            detail="Teacher access required"
        )

    test = MockTest(
        title=data.title,
        description=data.description,
        week=data.week,
        created_by=user.id,
        published=False,
    )

    db.add(test)
    db.commit()
    db.refresh(test)

    return {
        "message": "Mock test created",
        "test": {
            "id": test.id,
            "title": test.title,
            "week": test.week,
        }
    }


# --------------------------------
# TEACHER - ADD QUESTION
# --------------------------------

@router.post("/teacher/question")
def add_question(
    data: CreateQuestionRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):

    if user.role != "teacher":
        raise HTTPException(
            status_code=403,
            detail="Teacher access required"
        )

    test = db.query(MockTest).filter(
        MockTest.id == data.test_id,
        MockTest.created_by == user.id,
    ).first()

    if not test:
        raise HTTPException(
            status_code=404,
            detail="Test not found"
        )

    if data.correct_answer not in [0, 1, 2, 3]:
        raise HTTPException(
            status_code=400,
            detail="correct_answer must be 0, 1, 2 or 3"
        )

    question = MockQuestion(
        test_id=data.test_id,
        question=data.question,
        option_a=data.option_a,
        option_b=data.option_b,
        option_c=data.option_c,
        option_d=data.option_d,
        correct_answer=data.correct_answer,
        explanation=data.explanation,
    )

    db.add(question)
    db.commit()
    db.refresh(question)

    return {
        "message": "Question added",
        "question_id": question.id,
    }


# --------------------------------
# TEACHER - PUBLISH
# --------------------------------

@router.post("/teacher/{test_id}/publish")
def publish_test(
    test_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):

    if user.role != "teacher":
        raise HTTPException(
            status_code=403,
            detail="Teacher access required"
        )

    test = db.query(MockTest).filter(
        MockTest.id == test_id,
        MockTest.created_by == user.id,
    ).first()

    if not test:
        raise HTTPException(
            status_code=404,
            detail="Test not found"
        )

    question_count = db.query(MockQuestion).filter(
        MockQuestion.test_id == test_id
    ).count()

    if question_count == 0:
        raise HTTPException(
            status_code=400,
            detail="Add at least one question"
        )

    test.published = True

    db.commit()

    return {
        "message": "Mock test published successfully"
    }


# --------------------------------
# STUDENT - AVAILABLE TESTS
# --------------------------------

@router.get("/")
def get_tests(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):

    tests = db.query(MockTest).filter(
        MockTest.published == True
    ).order_by(
        MockTest.week.desc()
    ).all()

    return [
        {
            "id": test.id,
            "title": test.title,
            "description": test.description,
            "week": test.week,
        }
        for test in tests
    ]


# --------------------------------
# STUDENT - GET TEST
# --------------------------------

@router.get("/{test_id}")
def get_test(
    test_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):

    test = db.query(MockTest).filter(
        MockTest.id == test_id,
        MockTest.published == True,
    ).first()

    if not test:
        raise HTTPException(
            status_code=404,
            detail="Test not found"
        )

    questions = db.query(MockQuestion).filter(
        MockQuestion.test_id == test_id
    ).all()

    return {
        "id": test.id,
        "title": test.title,
        "week": test.week,
        "questions": [
            {
                "id": q.id,
                "question": q.question,
                "options": [
                    q.option_a,
                    q.option_b,
                    q.option_c,
                    q.option_d,
                ],
            }
            for q in questions
        ]
    }


# --------------------------------
# STUDENT - SUBMIT TEST
# --------------------------------

@router.post("/submit")
def submit_test(
    data: SubmitTestRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):

    if user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required"
        )

    test = db.query(MockTest).filter(
        MockTest.id == data.test_id,
        MockTest.published == True,
    ).first()

    if not test:
        raise HTTPException(
            status_code=404,
            detail="Test not found"
        )

    questions = db.query(MockQuestion).filter(
        MockQuestion.test_id == data.test_id
    ).all()

    attempt = MockAttempt(
        test_id=test.id,
        student_id=user.id,
        score=0,
        total_questions=len(questions),
    )

    db.add(attempt)
    db.flush()

    score = 0
    results = []

    submitted = {
        answer.question_id: answer.selected_answer
        for answer in data.answers
    }

    for question in questions:

        selected = submitted.get(
            question.id,
            -1
        )

        correct = (
            selected == question.correct_answer
        )

        if correct:
            score += 1

        answer = MockAnswer(
            attempt_id=attempt.id,
            question_id=question.id,
            selected_answer=selected,
            is_correct=correct,
        )

        db.add(answer)

        results.append({
            "question_id": question.id,
            "selected_answer": selected,
            "correct_answer": question.correct_answer,
            "correct": correct,
            "explanation": question.explanation,
        })

    attempt.score = score

    db.commit()

    return {
        "message": "Test submitted successfully",
        "score": score,
        "total": len(questions),
        "percentage": (
            round(score / len(questions) * 100, 2)
            if questions
            else 0
        ),
        "results": results,
    }