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
    StudentActivity,
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
        "category": "Local Geography (Kolkata)",
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
        "category": "Local Geography (Kolkata)",
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
    {
        "question": "Why are the East Kolkata Wetlands considered the 'Kidneys of Kolkata'?",
        "category": "Local Geography (Kolkata)",
        "option_a": "They naturally treat municipal wastewater, support aquaculture, and act as a flood basin",
        "option_b": "They are the highest mountain peak in the city",
        "option_c": "They prevent all rain from entering the city",
        "option_d": "They freeze during the winter season",
        "correct_answer": 0,
        "explanation": (
            "The East Kolkata Wetlands form a world-renowned Ramsar site that treats city wastewater "
            "using solar radiation and natural biological processes, while acting as a vital stormwater retention basin."
        ),
    },
    {
        "question": "Why does Kolkata frequently experience waterlogging during intense monsoon cloudbursts?",
        "category": "Local Geography (Kolkata)",
        "option_a": "Because the city slopes toward the Himalayas",
        "option_b": "Because of low-lying deltaic terrain and high tides in the Hooghly river hindering canal discharge",
        "option_c": "Because the city has no drainage channels at all",
        "option_d": "Because seawater directly overflows into every street daily",
        "correct_answer": 1,
        "explanation": (
            "Kolkata is built on low deltaic silt. When heavy monsoon rain coincides with high tides in the Hooghly, "
            "sluice gates must close, slowing drainage into the river."
        ),
    },
    {
        "question": "Which climate classification best describes Kolkata's tropical climate?",
        "category": "Local Geography (Kolkata)",
        "option_a": "Tropical Wet and Dry (Aw)",
        "option_b": "Polar Tundra (ET)",
        "option_c": "Arid Desert (BWh)",
        "option_d": "Subarctic (Dfc)",
        "correct_answer": 0,
        "explanation": (
            "Kolkata has a Tropical Wet and Dry climate (Aw) characterized by hot, humid summers, "
            "a pronounced monsoon season, and mild, pleasant winters."
        ),
    },
]


WEST_BENGAL_QUESTIONS = [
    {
        "question": "Why is the Sundarbans important to the geography of West Bengal?",
        "category": "Regional Geography (West Bengal)",
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
        "category": "Regional Geography (West Bengal)",
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
    {
        "question": "Why does North Bengal (Dooars and Terai) receive significantly higher rainfall than Purulia in western Bengal?",
        "category": "Regional Geography (West Bengal)",
        "option_a": "The Himalayas force moisture-laden monsoon winds upward (orographic rainfall)",
        "option_b": "North Bengal is closer to the Arabian Sea",
        "option_c": "Western Bengal has no sunshine",
        "option_d": "North Bengal has active volcanoes",
        "correct_answer": 0,
        "explanation": (
            "The Himalayan foothills in North Bengal obstruct the Bay of Bengal monsoon winds, "
            "causing heavy orographic rainfall, while the western plateau region receives comparatively less precipitation."
        ),
    },
    {
        "question": "Which river is widely known as the 'Lifeline of North Bengal'?",
        "category": "Regional Geography (West Bengal)",
        "option_a": "Teesta River",
        "option_b": "Subarnarekha",
        "option_c": "Damodar",
        "option_d": "Kangsabati",
        "correct_answer": 0,
        "explanation": (
            "Originating in the Himalayas of Sikkim, the Teesta River flows through North Bengal, "
            "nourishing the plains, supporting agriculture and shaping the region's topography."
        ),
    },
    {
        "question": "Why was the Damodar River historically called the 'Sorrow of Bengal'?",
        "category": "Regional Geography (West Bengal)",
        "option_a": "Because it caused catastrophic annual floods before multi-purpose dams were built",
        "option_b": "Because it has no fish",
        "option_c": "Because it dried up permanently in winter",
        "option_d": "Because it flows into a desert",
        "correct_answer": 0,
        "explanation": (
            "Before the construction of the Damodar Valley Corporation (DVC) dams and reservoirs, "
            "the river frequently inundated lowlands in Bardhaman, Hooghly and Howrah districts."
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
    {
        "question": "Why is the Thar Desert located in the northwestern part of India?",
        "category": "India Geography",
        "option_a": "The Aravalli Range lies parallel to the South-West monsoon winds, preventing moisture condensation",
        "option_b": "The region is too close to the North Pole",
        "option_c": "It receives heavy winter snow that dries up soil",
        "option_d": "There are no winds reaching northwestern India",
        "correct_answer": 0,
        "explanation": (
            "The Aravallis lie parallel to the path of the Arabian Sea branch of the monsoon, "
            "offering no barrier to force the winds to rise and produce rain."
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
# Location matching helpers
# ==================================================

CITY_ALIASES = {
    "kolkata": "kolkata",
    "calcutta": "kolkata",
    "beliaghata": "kolkata",
    "beleghata": "kolkata",
    "salt lake": "kolkata",
    "saltlake": "kolkata",
    "bidhannagar": "kolkata",
    "bidhan nagar": "kolkata",
    "howrah": "kolkata",
    "alipore": "kolkata",
    "dum dum": "kolkata",
    "dumdum": "kolkata",
    "jadavpur": "kolkata",
    "behala": "kolkata",
    "tollygunge": "kolkata",
    "new town": "kolkata",
    "newtown": "kolkata",
    "rajarhat": "kolkata",
    "ballygunge": "kolkata",
    "sealdah": "kolkata",
    "kasba": "kolkata",
    "garia": "kolkata",
    "barasat": "kolkata",
    "shyambazar": "kolkata",
}

REGION_ALIASES = {
    "west bengal": "west bengal",
    "west bengal state": "west bengal",
    "wb": "west bengal",
    "paschim banga": "west bengal",
    "paschimbanga": "west bengal",
}

COUNTRY_ALIASES = {
    "india": "india",
    "republic of india": "india",
    "in": "india",
}


def _location_key(value: str | None) -> str:
    """Normalize a location value for reliable matching."""
    if not value:
        return ""
    return " ".join(value.strip().lower().split())


def _city_key(value: str | None) -> str:
    key = _location_key(value)
    if "kolkata" in key or "calcutta" in key:
        return "kolkata"
    return CITY_ALIASES.get(key, key)


def _region_key(value: str | None) -> str:
    key = _location_key(value)
    if "west bengal" in key or "bengal" in key:
        return "west bengal"
    return REGION_ALIASES.get(key, key)


def _country_key(value: str | None) -> str:
    key = _location_key(value)
    if "india" in key:
        return "india"
    return COUNTRY_ALIASES.get(key, key)


# ==================================================
# Helper: choose today's question
# ==================================================

def choose_daily_question(
    today: date,
    location: CuriosityLocation | None,
):
    """
    Choose a question blueprint from the most specific available location level.
    Priority: city -> region -> country -> global
    """
    day_index = today.toordinal()

    city_key = _city_key(location.city if location else None)
    region_key = _region_key(location.region if location else None)
    country_key = _country_key(location.country if location else None)

    # 1. City level (e.g. Kolkata and its neighborhoods)
    if city_key == "kolkata":
        index = day_index % len(KOLKATA_QUESTIONS)
        return KOLKATA_QUESTIONS[index], "city"

    # 2. Region level (e.g. West Bengal)
    if region_key == "west bengal":
        index = day_index % len(WEST_BENGAL_QUESTIONS)
        return WEST_BENGAL_QUESTIONS[index], "region"

    # 3. Country level (e.g. India)
    if country_key == "india":
        index = day_index % len(INDIA_QUESTIONS)
        return INDIA_QUESTIONS[index], "country"

    # 4. Global fallback
    index = day_index % len(WORLD_QUESTIONS)
    return WORLD_QUESTIONS[index], "global"


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

    city = None
    region = None
    country = None

    if level == "city" and location:
        city = "Kolkata" if _city_key(location.city) == "kolkata" else location.city
        region = location.region or "West Bengal"
        country = location.country or "India"

    elif level == "region" and location:
        region = location.region or "West Bengal"
        country = location.country or "India"

    elif level == "country" and location:
        country = location.country or "India"

    # Check whether today's scoped question already exists in DB
    if level == "city":
        for c in db.query(CuriosityQuestion).filter(CuriosityQuestion.question_date == today, CuriosityQuestion.city.isnot(None)).all():
            if _city_key(c.city) == _city_key(city):
                return c, level

    elif level == "region":
        for c in db.query(CuriosityQuestion).filter(CuriosityQuestion.question_date == today, CuriosityQuestion.city.is_(None), CuriosityQuestion.region.isnot(None)).all():
            if _region_key(c.region) == _region_key(region):
                return c, level

    elif level == "country":
        for c in db.query(CuriosityQuestion).filter(CuriosityQuestion.question_date == today, CuriosityQuestion.city.is_(None), CuriosityQuestion.region.is_(None), CuriosityQuestion.country.isnot(None)).all():
            if _country_key(c.country) == _country_key(country):
                return c, level

    else:
        existing = db.query(CuriosityQuestion).filter(
            CuriosityQuestion.question_date == today,
            CuriosityQuestion.city.is_(None),
            CuriosityQuestion.region.is_(None),
            CuriosityQuestion.country.is_(None),
        ).first()
        if existing:
            return existing, level

    # Create new question
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

    # Find user's location
    location = (
        db.query(CuriosityLocation)
        .filter(
            CuriosityLocation.user_id == user_id
        )
        .first()
    )

    blueprint, target_level = choose_daily_question(today, location)

    question = None

    if target_level == "city" and location and location.city:
        city_k = _city_key(location.city)
        candidates = (
            db.query(CuriosityQuestion)
            .filter(
                CuriosityQuestion.question_date == today,
                CuriosityQuestion.city.isnot(None),
            )
            .all()
        )
        for c in candidates:
            if _city_key(c.city) == city_k:
                question = c
                break

    elif target_level == "region" and location and location.region:
        reg_k = _region_key(location.region)
        candidates = (
            db.query(CuriosityQuestion)
            .filter(
                CuriosityQuestion.question_date == today,
                CuriosityQuestion.city.is_(None),
                CuriosityQuestion.region.isnot(None),
            )
            .all()
        )
        for c in candidates:
            if _region_key(c.region) == reg_k:
                question = c
                break

    elif target_level == "country" and location and location.country:
        cntry_k = _country_key(location.country)
        candidates = (
            db.query(CuriosityQuestion)
            .filter(
                CuriosityQuestion.question_date == today,
                CuriosityQuestion.city.is_(None),
                CuriosityQuestion.region.is_(None),
                CuriosityQuestion.country.isnot(None),
            )
            .all()
        )
        for c in candidates:
            if _country_key(c.country) == cntry_k:
                question = c
                break

    elif target_level == "global":
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

    # If question not found for the target location level, generate it
    if not question:
        question, target_level = generate_daily_curiosity(
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
        target_level,
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
    db.add(
        StudentActivity(
            user_id=user_id,
            activity_type="curiosity",
            title="Completed daily Geography Curiosity",
            score=xp,
            details=(
                f"Question #{data.question_id}; "
                f"correct={is_correct}; xp={xp}"
            ),
        )
    )
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
