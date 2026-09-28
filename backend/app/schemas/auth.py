from typing import Literal
from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Literal["student", "teacher"] = "student"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str