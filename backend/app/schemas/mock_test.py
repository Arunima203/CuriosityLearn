from pydantic import BaseModel


class CreateTestRequest(BaseModel):
    title: str
    description: str | None = None
    week: int


class CreateQuestionRequest(BaseModel):
    test_id: int
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: int
    explanation: str | None = None


class SubmitAnswer(BaseModel):
    question_id: int
    selected_answer: int


class SubmitTestRequest(BaseModel):
    test_id: int
    answers: list[SubmitAnswer]