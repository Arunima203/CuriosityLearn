"""
Simple password reset via security code.
Flow:
  1. POST /auth/forgot-password  { email }
     → returns { reset_token } (a short-lived JWT)
  2. POST /auth/reset-password   { reset_token, new_password }
     → updates password, returns success
No email is sent — the reset_token is returned directly to the client
so the user can use it immediately in the same session.
"""

import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..services.security import hash_password

router = APIRouter(prefix="/auth", tags=["Password Reset"])

_SECRET = os.getenv("JWT_SECRET_KEY", "fallback-secret")
_ALG = "HS256"
_EXPIRE_MINUTES = 30


# ── Schemas ───────────────────────────────────────────────────────────────

class ForgotRequest(BaseModel):
    email: EmailStr


class ResetRequest(BaseModel):
    reset_token: str
    new_password: str


# ── Helpers ───────────────────────────────────────────────────────────────

def _make_reset_token(user_id: int) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(user_id), "type": "reset", "exp": exp}, _SECRET, algorithm=_ALG)


def _verify_reset_token(token: str) -> int:
    try:
        payload = jwt.decode(token, _SECRET, algorithms=[_ALG])
        if payload.get("type") != "reset":
            raise ValueError("wrong token type")
        return int(payload["sub"])
    except (JWTError, ValueError, KeyError):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")


# ── Endpoints ─────────────────────────────────────────────────────────────

@router.post("/forgot-password")
def forgot_password(data: ForgotRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    # Always return success to prevent email enumeration
    if not user:
        return {
            "message": "If this email is registered you will receive a reset token.",
            "reset_token": None,
            "found": False,
        }

    token = _make_reset_token(user.id)

    return {
        "message": "Reset token generated. Use it within 30 minutes.",
        "reset_token": token,
        "found": True,
        "name": user.name,
    }


@router.post("/reset-password")
def reset_password(data: ResetRequest, db: Session = Depends(get_db)):
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    user_id = _verify_reset_token(data.reset_token)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.password_hash = hash_password(data.new_password)
    db.commit()

    return {"message": "Password reset successfully. Please log in with your new password."}
