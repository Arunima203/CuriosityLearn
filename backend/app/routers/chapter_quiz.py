import random
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import ChapterQuizQuestion, User
from ..services.jwt import get_current_user_id, security

router = APIRouter(
    prefix="/chapter-quiz",
    tags=["Chapter Quiz"],
)


DEFAULT_CHAPTERS = [
    "Atmosphere / বায়ুমণ্ডল",
    "Lithosphere / ভূমিরূপ ও ভূ-প্রকৃতি",
    "Hydrosphere / বারিমণ্ডল ও জলভাগ",
    "Climate of India / ভারতের জলবায়ু",
    "Rivers & Water Resources / ভারতের নদনদী",
    "Natural Vegetation / স্বাভাবিক উদ্ভিদ",
    "Resources & Agriculture / সম্পদ ও কৃষি",
    "World Geography / বিশ্ব ভূগোল",
]

SEED_QUESTIONS = [
    # Atmosphere / বায়ুমণ্ডল
    {
        "chapter": "Atmosphere / বায়ুমণ্ডল",
        "question": "Which is the lowest layer of Earth's atmosphere where almost all weather events occur?",
        "option_a": "Stratosphere",
        "option_b": "Troposphere",
        "option_c": "Mesosphere",
        "option_d": "Thermosphere",
        "correct_answer": 1,
        "explanation": "The troposphere contains about 75% of the atmosphere's mass and is where clouds, rain, and storms occur.",
    },
    {
        "chapter": "Atmosphere / বায়ুমণ্ডল",
        "question": "The ozone layer which absorbs harmful ultraviolet (UV) radiation is located in which atmospheric layer?",
        "option_a": "Troposphere",
        "option_b": "Mesosphere",
        "option_c": "Stratosphere",
        "option_d": "Exosphere",
        "correct_answer": 2,
        "explanation": "The stratosphere contains the ozone layer, which shields life on Earth from damaging solar UV radiation.",
    },
    {
        "chapter": "Atmosphere / বায়ুমণ্ডল",
        "question": "Which gas is the most abundant in Earth's atmosphere?",
        "option_a": "Oxygen",
        "option_b": "Carbon Dioxide",
        "option_c": "Nitrogen",
        "option_d": "Argon",
        "correct_answer": 2,
        "explanation": "Nitrogen makes up approximately 78% of Earth's atmosphere, followed by oxygen at about 21%.",
    },
    {
        "chapter": "Atmosphere / বায়ুমণ্ডল",
        "question": "What instrument is used to measure atmospheric pressure?",
        "option_a": "Thermometer",
        "option_b": "Hygrometer",
        "option_c": "Barometer",
        "option_d": "Anemometer",
        "correct_answer": 2,
        "explanation": "A barometer measures atmospheric pressure, which helps meteorologists forecast weather changes.",
    },

    # Lithosphere / ভূমিরূপ ও ভূ-প্রকৃতি
    {
        "chapter": "Lithosphere / ভূমিরূপ ও ভূ-প্রকৃতি",
        "question": "Mount Everest, the highest peak in the world, belongs to which type of mountain?",
        "option_a": "Block Mountain",
        "option_b": "Young Fold Mountain",
        "option_c": "Volcanic Mountain",
        "option_d": "Residual Mountain",
        "correct_answer": 1,
        "explanation": "The Himalayas, including Mount Everest, are young fold mountains formed by the collision of the Indian and Eurasian tectonic plates.",
    },
    {
        "chapter": "Lithosphere / ভূমিরূপ ও ভূ-প্রকৃতি",
        "question": "Which is the oldest mountain range in India?",
        "option_a": "Himalayas",
        "option_b": "Western Ghats",
        "option_c": "Aravalli Range",
        "option_d": "Satpura Range",
        "correct_answer": 2,
        "explanation": "The Aravalli Range is one of the oldest fold mountain ranges in the world and the oldest in India.",
    },
    {
        "chapter": "Lithosphere / ভূমিরূপ ও ভূ-প্রকৃতি",
        "question": "What is the point on the Earth's surface directly above the focus of an earthquake called?",
        "option_a": "Epicentre",
        "option_b": "Hypocentre",
        "option_c": "Fault line",
        "option_d": "Crater",
        "correct_answer": 0,
        "explanation": "The epicenter is the point on the Earth's surface vertically above the focus (hypocenter) where seismic energy originates.",
    },

    # Hydrosphere / বারিমণ্ডল ও জলভাগ
    {
        "chapter": "Hydrosphere / বারিমণ্ডল ও জলভাগ",
        "question": "Which is the largest and deepest ocean in the world?",
        "option_a": "Atlantic Ocean",
        "option_b": "Indian Ocean",
        "option_c": "Pacific Ocean",
        "option_d": "Arctic Ocean",
        "correct_answer": 2,
        "explanation": "The Pacific Ocean covers more than 30% of Earth's surface and contains the Mariana Trench, the deepest spot on Earth.",
    },
    {
        "chapter": "Hydrosphere / বারিমণ্ডল ও জলভাগ",
        "question": "Tides in the ocean are primarily caused by the gravitational pull of which celestial body?",
        "option_a": "The Sun",
        "option_b": "The Moon",
        "option_c": "Mars",
        "option_d": "Jupiter",
        "correct_answer": 1,
        "explanation": "Because the Moon is much closer to Earth than the Sun, its gravitational pull exerts the strongest tide-generating force.",
    },
    {
        "chapter": "Hydrosphere / বারিমণ্ডল ও জলভাগ",
        "question": "Which ocean current is a warm ocean current flowing in the North Atlantic?",
        "option_a": "Canary Current",
        "option_b": "Labrador Current",
        "option_c": "Gulf Stream",
        "option_d": "California Current",
        "correct_answer": 2,
        "explanation": "The Gulf Stream is a powerful, warm Atlantic ocean current originating in the Gulf of Mexico that warms Western Europe.",
    },

    # Climate of India / ভারতের জলবায়ু
    {
        "chapter": "Climate of India / ভারতের জলবায়ু",
        "question": "Which winds bring the majority of rainfall to most parts of India?",
        "option_a": "North-East Monsoon winds",
        "option_b": "South-West Monsoon winds",
        "option_c": "Western Disturbances",
        "option_d": "Trade Winds",
        "correct_answer": 1,
        "explanation": "The South-West Monsoon (June to September) accounts for over 75% of India's annual rainfall.",
    },
    {
        "chapter": "Climate of India / ভারতের জলবায়ু",
        "question": "Which place in India and the world receives the highest average annual rainfall?",
        "option_a": "Cherrapunji",
        "option_b": "Mawsynram",
        "option_c": "Mahabaleshwar",
        "option_d": "Agumbe",
        "correct_answer": 1,
        "explanation": "Mawsynram in the Khasi Hills of Meghalaya holds the world record for the highest average annual rainfall.",
    },
    {
        "chapter": "Climate of India / ভারতের জলবায়ু",
        "question": "Why does the Coromandel Coast (Tamil Nadu) receive rainfall in winter (October–December)?",
        "option_a": "South-West Monsoon",
        "option_b": "Retreating / North-East Monsoon winds picking moisture over Bay of Bengal",
        "option_c": "Western Disturbances from the Mediterranean",
        "option_d": "Local convective storms",
        "correct_answer": 1,
        "explanation": "The North-East retreating monsoon winds blow over the Bay of Bengal, absorb moisture, and bring rain to Tamil Nadu.",
    },

    # Rivers & Water Resources / ভারতের নদনদী
    {
        "chapter": "Rivers & Water Resources / ভারতের নদনদী",
        "question": "Which is the longest river in India within its national boundary?",
        "option_a": "Godavari",
        "option_b": "Ganga",
        "option_c": "Brahmaputra",
        "option_d": "Indus",
        "correct_answer": 1,
        "explanation": "The Ganga is India's longest river, flowing for about 2,525 km before emptying into the Bay of Bengal.",
    },
    {
        "chapter": "Rivers & Water Resources / ভারতের নদনদী",
        "question": "Which river is known as the 'Dakshin Ganga' (Ganga of the South)?",
        "option_a": "Krishna",
        "option_b": "Kaveri",
        "option_c": "Godavari",
        "option_d": "Mahanadi",
        "correct_answer": 2,
        "explanation": "The Godavari is the longest peninsular river and is widely referred to as Dakshin Ganga or Vriddha Ganga.",
    },
    {
        "chapter": "Rivers & Water Resources / ভারতের নদনদী",
        "question": "Which two major peninsular rivers flow westward and drain into the Arabian Sea through rift valleys?",
        "option_a": "Mahanadi and Godavari",
        "option_b": "Krishna and Kaveri",
        "option_c": "Narmada and Tapi",
        "option_d": "Ganga and Yamuna",
        "correct_answer": 2,
        "explanation": "Narmada and Tapi flow westwards through faulted rift valleys between the Vindhya and Satpura ranges into the Arabian Sea.",
    },

    # Natural Vegetation / স্বাভাবিক উদ্ভিদ
    {
        "chapter": "Natural Vegetation / স্বাভাবিক উদ্ভিদ",
        "question": "The Sundarbans delta in West Bengal is globally famous for which type of natural vegetation?",
        "option_a": "Coniferous Alpine Forest",
        "option_b": "Mangrove / Tidal Forest",
        "option_c": "Tropical Thorn Forest",
        "option_d": "Temperate Deciduous Forest",
        "correct_answer": 1,
        "explanation": "The Sundarbans is the world's largest mangrove forest, known for the Sundari tree (Heritiera fomes) and high tidal biodiversity.",
    },
    {
        "chapter": "Natural Vegetation / স্বাভাবিক উদ্ভিদ",
        "question": "Which type of forest covers the largest area in India?",
        "option_a": "Tropical Wet Evergreen Forest",
        "option_b": "Tropical Moist Deciduous Forest",
        "option_c": "Mangrove Forest",
        "option_d": "Montane Forest",
        "correct_answer": 1,
        "explanation": "Tropical Deciduous (Monsoon) forests are the most widespread in India, shedding their leaves for about six to eight weeks in summer.",
    },

    # World Geography / বিশ্ব ভূগোল
    {
        "chapter": "World Geography / বিশ্ব ভূগোল",
        "question": "Which is the largest desert in the world (including polar regions)?",
        "option_a": "Sahara Desert",
        "option_b": "Antarctic Desert",
        "option_c": "Gobi Desert",
        "option_d": "Arabian Desert",
        "correct_answer": 1,
        "explanation": "The Antarctic Polar Desert is the largest desert on Earth by area, while the Sahara is the largest hot desert.",
    },
    {
        "chapter": "World Geography / বিশ্ব ভূগোল",
        "question": "Which line of latitude divides the Earth into the Northern and Southern Hemispheres?",
        "option_a": "Tropic of Cancer",
        "option_b": "Equator (0°)",
        "option_c": "Prime Meridian",
        "option_d": "Tropic of Capricorn",
        "correct_answer": 1,
        "explanation": "The Equator at 0° latitude divides our planet into the Northern and Southern Hemispheres.",
    },
    {
        "chapter": "World Geography / বিশ্ব ভূগোল",
        "question": "What is the capital of Japan?",
        "option_a": "Kyoto",
        "option_b": "Osaka",
        "option_c": "Tokyo",
        "option_d": "Hiroshima",
        "correct_answer": 2,
        "explanation": "Tokyo is the capital and most populous metropolitan area of Japan.",
    },
]


def seed_questions_if_needed(db: Session):
    count = db.query(ChapterQuizQuestion).count()
    if count == 0:
        for q in SEED_QUESTIONS:
            item = ChapterQuizQuestion(
                chapter=q["chapter"],
                question=q["question"],
                option_a=q["option_a"],
                option_b=q["option_b"],
                option_c=q["option_c"],
                option_d=q["option_d"],
                correct_answer=q["correct_answer"],
                explanation=q["explanation"],
                created_by=None,
            )
            db.add(item)
        db.commit()


def get_current_teacher(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    user_id = get_current_user_id(credentials)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can add or manage chapter quiz questions")
    return user


class CreateChapterQuestionRequest(BaseModel):
    chapter: str = Field(..., min_length=2, max_length=150)
    question: str = Field(..., min_length=3)
    option_a: str = Field(..., min_length=1, max_length=500)
    option_b: str = Field(..., min_length=1, max_length=500)
    option_c: str = Field(..., min_length=1, max_length=500)
    option_d: str = Field(..., min_length=1, max_length=500)
    correct_answer: int = Field(..., ge=0, le=3)
    explanation: str | None = None


# ---------------------------------------------------------------------------
# Public / Student & Teacher Endpoints
# ---------------------------------------------------------------------------

@router.get("/chapters")
def get_quiz_chapters(db: Session = Depends(get_db)):
    """Returns all chapters with their available question count."""
    seed_questions_if_needed(db)

    # Group counts in DB
    counts = (
        db.query(ChapterQuizQuestion.chapter, func.count(ChapterQuizQuestion.id))
        .group_by(ChapterQuizQuestion.chapter)
        .all()
    )
    count_map = {c[0]: c[1] for c in counts}

    # Merge default curriculum chapters and any custom chapters created by teachers
    result = []
    seen = set()

    for ch in DEFAULT_CHAPTERS:
        result.append({
            "chapter": ch,
            "question_count": count_map.get(ch, 0),
        })
        seen.add(ch)

    for ch, count in count_map.items():
        if ch not in seen:
            result.append({
                "chapter": ch,
                "question_count": count,
            })
            seen.add(ch)

    total_questions = sum(count_map.values())

    return {
        "total_questions": total_questions,
        "chapters": result,
    }


@router.get("/questions")
def get_quiz_questions(
    chapter: str | None = Query(None, description="Chapter name, or 'All' / omit for all chapters"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Fetch questions for a quiz session, filtered by chapter if requested."""
    seed_questions_if_needed(db)

    query = db.query(ChapterQuizQuestion)

    if chapter and chapter.strip() and chapter.strip().lower() != "all":
        query = query.filter(ChapterQuizQuestion.chapter == chapter.strip())

    questions = query.all()

    if not questions:
        # Fallback to all questions if specific chapter has none
        questions = db.query(ChapterQuizQuestion).all()

    selected = random.sample(questions, min(len(questions), limit))

    return [
        {
            "id": q.id,
            "chapter": q.chapter,
            "question": q.question,
            "options": [q.option_a, q.option_b, q.option_c, q.option_d],
            "answer": q.correct_answer,
            "explanation": q.explanation,
        }
        for q in selected
    ]


# ---------------------------------------------------------------------------
# Teacher Management Endpoints
# ---------------------------------------------------------------------------

@router.post("/teacher/question")
def add_chapter_question(
    data: CreateChapterQuestionRequest,
    teacher: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Teacher adds a new question to a specific chapter."""
    chapter_clean = data.chapter.strip()
    if not chapter_clean:
        raise HTTPException(status_code=400, detail="Chapter name cannot be empty")

    new_q = ChapterQuizQuestion(
        chapter=chapter_clean,
        question=data.question.strip(),
        option_a=data.option_a.strip(),
        option_b=data.option_b.strip(),
        option_c=data.option_c.strip(),
        option_d=data.option_d.strip(),
        correct_answer=data.correct_answer,
        explanation=data.explanation.strip() if data.explanation else None,
        created_by=teacher.id,
    )

    db.add(new_q)
    db.commit()
    db.refresh(new_q)

    return {
        "message": f"Question added successfully to '{new_q.chapter}'",
        "question": {
            "id": new_q.id,
            "chapter": new_q.chapter,
            "question": new_q.question,
            "options": [new_q.option_a, new_q.option_b, new_q.option_c, new_q.option_d],
            "answer": new_q.correct_answer,
            "explanation": new_q.explanation,
        },
    }


@router.get("/teacher/questions")
def get_teacher_chapter_questions(
    chapter: str | None = Query(None),
    teacher: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Teacher gets list of all questions, optionally filtered by chapter."""
    seed_questions_if_needed(db)

    query = db.query(ChapterQuizQuestion)
    if chapter and chapter.strip() and chapter.strip().lower() != "all":
        query = query.filter(ChapterQuizQuestion.chapter == chapter.strip())

    questions = query.order_by(ChapterQuizQuestion.id.desc()).all()

    return [
        {
            "id": q.id,
            "chapter": q.chapter,
            "question": q.question,
            "options": [q.option_a, q.option_b, q.option_c, q.option_d],
            "answer": q.correct_answer,
            "explanation": q.explanation,
            "created_by": q.created_by,
            "created_at": q.created_at.isoformat() if q.created_at else None,
        }
        for q in questions
    ]


@router.delete("/teacher/question/{question_id}")
def delete_chapter_question(
    question_id: int,
    teacher: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    """Teacher deletes a question."""
    q = db.query(ChapterQuizQuestion).filter(ChapterQuizQuestion.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    chapter = q.chapter
    db.delete(q)
    db.commit()

    return {
        "message": f"Question #{question_id} deleted from '{chapter}' successfully",
    }
