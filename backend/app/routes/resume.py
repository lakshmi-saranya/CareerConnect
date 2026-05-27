from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.database.mongodb import database
from app.routes.auth import get_current_user
import datetime

router = APIRouter()
resume_col = database.get_collection("user_resumes")


class ResumeSaveRequest(BaseModel):
    resume_text: str


@router.post("/resume/save")
async def save_resume(body: ResumeSaveRequest, user=Depends(get_current_user)):
    await resume_col.update_one(
        {"user_id": user["user_id"]},
        {"$set": {
            "user_id":     user["user_id"],
            "resume_text": body.resume_text,
            "updated_at":  datetime.datetime.utcnow(),
        }},
        upsert=True
    )
    return {"message": "Resume saved successfully"}


@router.get("/resume/me")
async def get_resume(user=Depends(get_current_user)):
    doc = await resume_col.find_one({"user_id": user["user_id"]})
    if not doc:
        return {"resume_text": None}
    return {"resume_text": doc["resume_text"]}
