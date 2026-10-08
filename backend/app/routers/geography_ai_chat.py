import os

import requests
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel, Field

from ..services.jwt import get_current_user_id, security


router = APIRouter(
    prefix="/ai",
    tags=["AI Tutor"],
)


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., min_length=1, max_length=4000)


class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    history: list[ChatMessage] = Field(default_factory=list)


def _build_prompt(data: AIChatRequest) -> str:
    history = data.history[-12:]

    lines = [
        "You are Geography AI Tutor for CuriosityLearn.",
        "Your job is to teach Geography clearly and accurately.",
        "Prefer simple language and short paragraphs.",
        "Use examples, bullet points, and step-by-step explanations when useful.",
        "If the student asks for a quiz, create a short Geography quiz and wait for the student's answers.",
        "If the question is unrelated to Geography, politely guide the student back toward Geography.",
        "Do not pretend to know personal student data.",
        "Answer in the same language style as the student's question when practical.",
        "",
        "Conversation:",
    ]

    for item in history:
        speaker = "Student" if item.role == "user" else "Tutor"
        lines.append(f"{speaker}: {item.content}")

    lines.append(f"Student's latest question: {data.message}")
    lines.append("Tutor:")

    return "\n".join(lines)


@router.post("/chat")
def geography_ai_chat(
    data: AIChatRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    # Require a logged-in CuriosityLearn user.
    get_current_user_id(credentials)

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail=(
                "GEMINI_API_KEY is not configured. "
                "Add it to the backend environment and restart the server."
            ),
        )

    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent"
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": _build_prompt(data),
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 900,
        },
    }

    try:
        response = requests.post(
            url,
            params={"key": api_key},
            json=payload,
            timeout=45,
        )
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=502,
            detail="Could not connect to the AI service.",
        ) from exc

    if not response.ok:
        try:
            error_data = response.json()
            detail = (
                error_data.get("error", {}).get("message")
                or "AI service returned an error."
            )
        except ValueError:
            detail = "AI service returned an error."

        raise HTTPException(
            status_code=502,
            detail=detail,
        )

    try:
        result = response.json()
        parts = (
            result.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [])
        )
        reply = "".join(
            part.get("text", "")
            for part in parts
            if isinstance(part, dict)
        ).strip()
    except (IndexError, AttributeError, TypeError, ValueError):
        reply = ""

    if not reply:
        raise HTTPException(
            status_code=502,
            detail="AI service returned an empty response.",
        )

    return {
        "reply": reply,
        "model": model,
    }
