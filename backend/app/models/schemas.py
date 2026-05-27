from pydantic import BaseModel
from typing import Optional

class GoogleAuthRequest(BaseModel):
    token: str  # Google ID token from frontend

class UserOut(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    access_token: str  # JWT returned to frontend

class Resume(BaseModel):
    name: str
    skills: str
    experience: str

class Job(BaseModel):
    title: str
    requirements: str

class MatchRequest(BaseModel):
    resume_text: str
    job_text: str
