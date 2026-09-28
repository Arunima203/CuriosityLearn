from pydantic import BaseModel


class StudentProfileCreate(BaseModel):
    class_name: str
    board: str
    medium: str


class StudentProfileResponse(BaseModel):
    id: int
    user_id: int
    class_name: str
    board: str
    medium: str