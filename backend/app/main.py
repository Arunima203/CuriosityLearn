from dotenv import load_dotenv

load_dotenv()
from fastapi import FastAPI
import requests
from fastapi.middleware.cors import CORSMiddleware

from .database import engine
from .database import Base
from .routers.auth import router as auth_router
from .routers.student_profile import router as student_profile_router
from .routers.mock_test import router as mock_test_router
from .routers.curiosity import router as curiosity_router
from .routers.curiosity_location import router as curiosity_location_router
from .services.curiosity_scheduler import (
    start_curiosity_scheduler,
    stop_curiosity_scheduler,
)
from .routers.notifications import router as notifications_router
from .routers.geography_content import router as geography_content_router
from .routers.geography_ai_chat import router as geography_ai_chat_router
from .models import User, StudentProfile, CuriosityQuestion, CuriosityAnswer, KnowledgeItem
from .routers.knowledge_center import router as knowledge_center_router
from .routers.chapter_quiz import router as chapter_quiz_router
from .routers.admin import router as admin_router
from .routers.learning_content import router as learning_content_router

# Student Progress
from .routers.student_progress import (
    student_router as student_progress_router,
    teacher_router as teacher_progress_router,
)


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="CuriosityLearn API",
    description="Interactive multi-class learning platform",
    version="1.0.0",
)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def start_scheduler():
    start_curiosity_scheduler()


@app.on_event("shutdown")
def stop_scheduler():
    stop_curiosity_scheduler()


# Routers
app.include_router(auth_router)
app.include_router(student_profile_router)
app.include_router(mock_test_router)
app.include_router(curiosity_router)
app.include_router(curiosity_location_router)
app.include_router(notifications_router)

app.include_router(student_progress_router)
app.include_router(teacher_progress_router)
app.include_router(geography_content_router)
app.include_router(geography_ai_chat_router)
app.include_router(knowledge_center_router)
app.include_router(chapter_quiz_router)
app.include_router(admin_router)
app.include_router(learning_content_router)



# -----------------------------
# Basic endpoints
# -----------------------------

@app.get("/")
def root():
    return {
        "message": "CuriosityLearn Backend Running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/database-test")
def database_test():
    try:
        with engine.connect():
            return {
                "status": "success",
                "message": "Database connected successfully",
            }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
        }


# -----------------------------
# GeoNames
# -----------------------------

GEONAMES_USERNAME = "arunima_sen"


@app.get("/geonames/country")
def geonames_country(name: str):
    try:

        # Step 1:
        # Country name দিয়ে GeoNames থেকে country code খুঁজবে

        search_response = requests.get(
            "http://api.geonames.org/searchJSON",
            params={
                "name": name,
                "featureCode": "PCLI",
                "maxRows": 1,
                "username": GEONAMES_USERNAME,
            },
            timeout=10,
        )

        search_response.raise_for_status()

        search_data = search_response.json()

        if not search_data.get("geonames"):
            return {
                "error": "GeoNames country পাওয়া যায়নি"
            }

        country_code = search_data["geonames"][0]["countryCode"]

        # Step 2:
        # Country code দিয়ে complete country information আনবে

        info_response = requests.get(
            "http://api.geonames.org/countryInfoJSON",
            params={
                "country": country_code,
                "username": GEONAMES_USERNAME,
            },
            timeout=10,
        )

        info_response.raise_for_status()

        info_data = info_response.json()

        if not info_data.get("geonames"):
            return {
                "error": "Country information পাওয়া যায়নি"
            }

        # Step 3:
        # Country information frontend-এ পাঠাবে

        return info_data["geonames"][0]

    except requests.RequestException as e:

        return {
            "error": f"GeoNames request failed: {str(e)}"
        }