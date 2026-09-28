from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import (
    CuriosityQuestion,
    CuriosityAnswer,
    CuriosityLocation,
)
from ..services.jwt import get_current_user_id, security


router = APIRouter(
    prefix="/curiosity",
    tags=["Curiosity"],
)


class CuriosityAnswerRequest(BaseModel):
    question_id: int
    answer: int


# ==================================================
# Daily Curiosity Question Bank
# ==================================================

KOLKATA_QUESTIONS = [
    {
        "question": "Why does Kolkata receive heavy monsoon rainfall?",
        "category": "Local Geography",
        "option_a": "Because Kolkata is near the Arctic Circle",
        "option_b": "Because seasonal monsoon winds bring moisture from the Bay of Bengal",
        "option_c": "Because Kolkata is in a desert",
        "option_d": "Because Kolkata has no rivers nearby",
        "correct_answer": 1,
        "explanation": (
            "During the summer monsoon, moisture-rich winds from the Bay of Bengal "
            "bring substantial rainfall to eastern India, including Kolkata."
        ),
    },
    {
        "question": "Why is the Hooghly River important to Kolkata's geography?",
        "category": "Local Geography",
        "option_a": "It is a branch of the Ganges river system and has long influenced Kolkata's location and development",
        "option_b": "It flows from Antarctica",
        "option_c": "It is a river in the Sahara Desert",
        "option_d": "It is completely underground",
        "correct_answer": 0,
        "explanation": (
            "The Hooghly is a distributary of the Ganges river system and has played "
            "an important role in Kolkata's physical and human geography."
        ),
    },
]


WEST_BENGAL_QUESTIONS = [
    {
        "question": "Why is the Sundarbans important to the geography of West Bengal?",
        "category": "Regional Geography",
        "option_a": "It contains one of the world's largest mangrove ecosystems",
        "option_b": "It is India's highest mountain range",
        "option_c": "It is a large desert",
        "option_d": "It is completely surrounded by glaciers",
        "correct_answer": 0,
        "explanation": (
            "The Sundarbans is a vast mangrove ecosystem in the Ganges-Brahmaputra "
            "delta region and is strongly connected to the physical geography of West Bengal."
        ),
    },
    {
        "question": "Why is Darjeeling generally cooler than Kolkata?",
        "category": "Regional Geography",
        "option_a": "Darjeeling is at a much higher elevation",
        "option_b": "Darjeeling is closer to the Equator",
        "option_c": "Darjeeling is below sea level",
        "option_d": "Darjeeling has no rainfall",
        "correct_answer": 0,
        "explanation": (
            "Temperature generally decreases with increasing elevation, so the "
            "high-elevation location of Darjeeling contributes to its cooler climate."
        ),
    },
]


INDIA_QUESTIONS = [
    {
        "question": "Why does India experience a seasonal monsoon?",
        "category": "India Geography",
        "option_a": "Because land and ocean heat differently through the year",
        "option_b": "Because India is located at the South Pole",
        "option_c": "Because India has no surrounding seas",
        "option_d": "Because all Indian rivers flow uphill",
        "correct_answer": 0,
        "explanation": (
            "Seasonal differences in heating between land and ocean contribute "
            "to the reversal of winds associated with the Indian monsoon."
        ),
    },
    {
        "question": "Why do the Western Ghats receive heavy rainfall on their windward side during the monsoon?",
        "category": "India Geography",
        "option_a": "Moist air is forced upward over the mountains and cools",
        "option_b": "The mountains create deserts on every side",
        "option_c": "The region is permanently covered by snow",
        "option_d": "The rainfall comes from underground rivers",
        "correct_answer": 0,
        "explanation": (
            "Moist monsoon air rises when it encounters the Western Ghats. "
            "As the air rises and cools, condensation produces rainfall."
        ),
    },
    {
        "question": "Why does India have such a wide variety of climates?",
        "category": "India Geography",
        "option_a": "Because India has differences in latitude, elevation, relief and distance from the sea",
        "option_b": "Because every part of India has the same altitude",
        "option_c": "Because India has no mountains",
        "option_d": "Because all of India lies inside one desert",
        "correct_answer": 0,
        "explanation": (
            "India's large size, varied latitude, mountains, plateaus, plains and "
            "different distances from the sea create strong climatic variation."
        ),
    },
]


WORLD_QUESTIONS = [
    {
        "question": "Why does Russia span so many time zones?",
        "category": "World Geography",
        "option_a": "Because Russia is very close to the Equator",
        "option_b": "Because Russia stretches across a very large east-west distance",
        "option_c": "Because Russia has many islands",
        "option_d": "Because Russia has the highest mountains",
        "correct_answer": 1,
        "explanation": (
            "Russia stretches across a huge distance from west to east, "
            "so it crosses many lines of longitude and therefore many time zones."
        ),
    },
    {
        "question": "Why do river deltas often form near a river's mouth?",
        "category": "World Geography",
        "option_a": "Because flowing water can lose energy and deposit sediment",
        "option_b": "Because rivers suddenly become mountains",
        "option_c": "Because seawater always freezes there",
        "option_d": "Because all rivers flow underground near the coast",
        "correct_answer": 0,
        "explanation": (
            "When a river enters a slower-moving body of water, its energy can decrease, "
            "allowing transported sediment to settle and accumulate."
        ),
    },
    {
        "question": "Why can places at similar latitudes have very different climates?",
        "category": "World Geography",
        "option_a": "Because elevation, oceans, winds, mountains and ocean currents also affect climate",
        "option_b": "Because latitude never affects climate",
        "option_c": "Because all climates are controlled only by population",
        "option_d": "Because longitude determines everything about climate",
        "correct_answer": 0,
        "explanation": (
            "Latitude is important, but elevation, nearby oceans, prevailing winds, "
            "mountains and ocean currents can create major climate differences."
        ),
    },
    {
        "question": "Why is it usually cooler at high elevations?",
        "category": "Earth Geography",
        "option_a": "Air pressure generally decreases with height and rising air expands and cools",
        "option_b": "Mountains create their own Sun",
        "option_c": "High places receive no sunlight",
        "option_d": "All high places are permanently covered in ice",
        "correct_answer": 0,
        "explanation": (
            "As air rises, pressure decreases. The expanding air generally cools, "
            "which contributes to lower temperatures at higher elevations."
        ),
    },
    {
        "question": "Why do coastal areas often have smaller temperature ranges than inland areas?",
        "category": "Climate Geography",
        "option_a": "Water heats and cools more slowly than land",
        "option_b": "The ocean blocks all sunlight",
        "option_c": "Coastal areas have no winds",
        "option_d": "Land cannot absorb heat",
        "correct_answer": 0,
        "explanation": (
            "Water has a high heat capacity, so large bodies of water heat and cool "
            "more slowly than land, moderating nearby temperatures."
        ),
    },
    {
        "question": "Why are many major cities located near rivers or coasts?",
        "category": "Human Geography",
        "option_a": "Water supports transport, settlement, trade and access to resources",
        "option_b": "Rivers make every city colder",
        "option_c": "Coastal areas have no natural hazards",
        "option_d": "Cities can only grow beside water",
        "correct_answer": 0,
        "explanation": (
            "Rivers and coasts have historically supported transportation, trade, "
            "water supply and settlement, although they can also bring hazards."
        ),
    },
]


# ==================================================
# Helper: choose today's question
# ==================================================

def choose_daily_question(
    today: date,
    location: CuriosityLocation | None,
):
    """
    Returns:
        (question_blueprint, personalization_level)
    """

    day_index = today.toordinal()

    # ----------------------------------------------
    # City level
    # ----------------------------------------------

    if (
        location
        and location.city
        and location.city.strip().lower() == "kolkata"
    ):
        index = day_index % len(KOLKATA_QUESTIONS)

        return (
            KOLKATA_QUESTIONS[index],
            "city",
        )

    # ----------------------------------------------
    # Region level
    # ----------------------------------------------

    if (
        location
        and location.region
        and location.region.strip().lower() == "west bengal"
    ):
        index = day_index % len(WEST_BENGAL_QUESTIONS)

        return (
            WEST_BENGAL_QUESTIONS[index],
            "region",
        )

    # ----------------------------------------------
    # Country level
    # ----------------------------------------------

    if (
        location
        and location.country
        and location.country.strip().lower() == "india"
    ):
        index = day_index % len(INDIA_QUESTIONS)

        return (
            INDIA_QUESTIONS[index],
            "country",
        )

    # ----------------------------------------------
    # Global fallback
    # ----------------------------------------------

    index = day_index % len(WORLD_QUESTIONS)

    return (
        WORLD_QUESTIONS[index],
        "global",
    )


# ==================================================
# Create daily question automatically
# ==================================================

def generate_daily_curiosity(
    db: Session,
    today: date,
    location: CuriosityLocation | None,
):
    blueprint, level = choose_daily_question(
        today,
        location,
    )

    # ----------------------------------------------
    # Set location scope
    # ----------------------------------------------

    city = None
    region = None
    country = None

    if level == "city" and location:
        city = location.city
        region = location.region
        country = location.country

    elif level == "region" and location:
        region = location.region
        country = location.country

    elif level == "country" and location:
        country = location.country

    # ----------------------------------------------
    # Check whether today's scoped question exists
    # ----------------------------------------------

    existing_query = (
        db.query(CuriosityQuestion)
        .filter(
            CuriosityQuestion.question_date == today,
        )
    )

    if level == "city":
        existing_query = existing_query.filter(
            CuriosityQuestion.city == city,
            CuriosityQuestion.region == region,
            CuriosityQuestion.country == country,
        )

    elif level == "region":
        existing_query = existing_query.filter(
            CuriosityQuestion.city.is_(None),
            CuriosityQuestion.region == region,
            CuriosityQuestion.country == country,
        )

    elif level == "country":
        existing_query = existing_query.filter(
            CuriosityQuestion.city.is_(None),
            CuriosityQuestion.region.is_(None),
            CuriosityQuestion.country == country,
        )

    else:
        existing_query = existing_query.filter(
            CuriosityQuestion.city.is_(None),
            CuriosityQuestion.region.is_(None),
            CuriosityQuestion.country.is_(None),
        )

    existing = existing_query.first()

    if existing:
        return existing, level

    # ----------------------------------------------
    # Create new question
    # ----------------------------------------------

    question = CuriosityQuestion(
        question=blueprint["question"],
        category=blueprint["category"],
        option_a=blueprint["option_a"],
        option_b=blueprint["option_b"],
        option_c=blueprint["option_c"],
        option_d=blueprint["option_d"],
        correct_answer=blueprint["correct_answer"],
        explanation=blueprint["explanation"],
        question_date=today,
        city=city,
        region=region,
        country=country,
    )

    db.add(question)
    db.commit()
    db.refresh(question)

    return question, level


# ==================================================
# Helper: response
# ==================================================

def curiosity_response(
    question: CuriosityQuestion,
    personalization_level: str,
):
    return {
        "id": question.id,
        "question": question.question,
        "category": question.category,
        "options": [
            question.option_a,
            question.option_b,
            question.option_c,
            question.option_d,
        ],
        "correct_answer": question.correct_answer,
        "explanation": question.explanation,
        "question_date": question.question_date,
        "city": question.city,
        "region": question.region,
        "country": question.country,
        "personalization_level": personalization_level,
    }


# ==================================================
# Today's Curiosity
# ==================================================

@router.get("/today")
def get_today_curiosity(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id(credentials)

    today = date.today()

    # ----------------------------------------------
    # Find user's location
    # ----------------------------------------------

    location = (
        db.query(CuriosityLocation)
        .filter(
            CuriosityLocation.user_id == user_id
        )
        .first()
    )

    # ----------------------------------------------
    # Find today's existing question
    # ----------------------------------------------

    question = None
    personalization_level = "global"

    if location and location.city:
        question = (
            db.query(CuriosityQuestion)
            .filter(
                CuriosityQuestion.question_date == today,
                CuriosityQuestion.city == location.city,
                CuriosityQuestion.region == location.region,
                CuriosityQuestion.country == location.country,
            )
            .first()
        )

        if question:
            personalization_level = "city"

    # ----------------------------------------------
    # Region
    # ----------------------------------------------

    if not question and location and location.region:
        question = (
            db.query(CuriosityQuestion)
            .filter(
                CuriosityQuestion.question_date == today,
                CuriosityQuestion.city.is_(None),
                CuriosityQuestion.region == location.region,
                CuriosityQuestion.country == location.country,
            )
            .first()
        )

        if question:
            personalization_level = "region"

    # ----------------------------------------------
    # Country
    # ----------------------------------------------

    if not question and location and location.country:
        question = (
            db.query(CuriosityQuestion)
            .filter(
                CuriosityQuestion.question_date == today,
                CuriosityQuestion.city.is_(None),
                CuriosityQuestion.region.is_(None),
                CuriosityQuestion.country == location.country,
            )
            .first()
        )

        if question:
            personalization_level = "country"

    # ----------------------------------------------
    # Global
    # ----------------------------------------------

    if not question:
        question = (
            db.query(CuriosityQuestion)
            .filter(
                CuriosityQuestion.question_date == today,
                CuriosityQuestion.city.is_(None),
                CuriosityQuestion.region.is_(None),
                CuriosityQuestion.country.is_(None),
            )
            .first()
        )

        if question:
            personalization_level = "global"

    # ----------------------------------------------
    # If today's question does not exist,
    # automatically generate it
    # ----------------------------------------------

    if not question:
        question, personalization_level = generate_daily_curiosity(
            db=db,
            today=today,
            location=location,
        )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Today's curiosity question is not available yet",
        )

    return curiosity_response(
        question,
        personalization_level,
    )


# ==================================================
# Submit Curiosity Answer
# ==================================================

@router.post("/answer")
def answer_curiosity(
    data: CuriosityAnswerRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id(credentials)

    question = (
        db.query(CuriosityQuestion)
        .filter(
            CuriosityQuestion.id == data.question_id
        )
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Curiosity question not found",
        )

    existing_answer = (
        db.query(CuriosityAnswer)
        .filter(
            CuriosityAnswer.user_id == user_id,
            CuriosityAnswer.question_id == data.question_id,
        )
        .first()
    )

    if existing_answer:
        return {
            "message": "You have already answered this curiosity question",
            "question_id": question.id,
            "correct": existing_answer.is_correct,
            "selected_answer": existing_answer.selected_answer,
            "correct_answer": question.correct_answer,
            "xp_earned": 0,
            "explanation": question.explanation,
        }

    is_correct = (
        data.answer == question.correct_answer
    )

    xp = 10 if is_correct else 2

    answer = CuriosityAnswer(
        user_id=user_id,
        question_id=question.id,
        selected_answer=data.answer,
        is_correct=is_correct,
        xp_earned=xp,
    )

    db.add(answer)
    db.commit()
    db.refresh(answer)

    return {
        "message": "Answer submitted successfully",
        "question_id": question.id,
        "correct": is_correct,
        "selected_answer": data.answer,
        "correct_answer": question.correct_answer,
        "xp_earned": xp,
        "explanation": question.explanation,
    }


# ==================================================
# Curiosity History
# ==================================================

@router.get("/history")
def get_curiosity_history(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    user_id = get_current_user_id(credentials)

    history = (
        db.query(
            CuriosityAnswer,
            CuriosityQuestion,
        )
        .join(
            CuriosityQuestion,
            CuriosityAnswer.question_id
            == CuriosityQuestion.id,
        )
        .filter(
            CuriosityAnswer.user_id == user_id
        )
        .order_by(
            CuriosityAnswer.answered_at.desc()
        )
        .all()
    )

    return [
        {
            "answer_id": answer.id,
            "question_id": question.id,
            "question": question.question,
            "category": question.category,
            "selected_answer": answer.selected_answer,
            "correct_answer": question.correct_answer,
            "correct": answer.is_correct,
            "xp_earned": answer.xp_earned,
            "answered_at": answer.answered_at,
        }
        for answer, question in history
    ]