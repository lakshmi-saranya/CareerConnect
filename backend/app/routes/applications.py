from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.database.mongodb import database
from app.routes.auth import get_current_user
from bson import ObjectId
import datetime

router = APIRouter()
apps_col = database.get_collection("applications")


class ApplicationRequest(BaseModel):
    job_title:    str
    company:      str
    cover_letter: str
    status:       str 


class ApplicationStatusUpdate(BaseModel):
    status: str  # "Pending" | "Submitted" | "Rejected" | "Accepted"


def _serialize(doc):
    doc["id"] = str(doc.pop("_id"))
    return doc


@router.post("/applications")
async def create_application(body: ApplicationRequest, user=Depends(get_current_user)):
    doc = {
        "user_id":     user["user_id"],
        "job_title":   body.job_title,
        "company":     body.company,
        "cover_letter": body.cover_letter,
        "status":      body.status,
        "created_at":  datetime.datetime.utcnow(),
    }
    result = await apps_col.insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Application saved"}


@router.get("/applications/me")
async def get_applications(user=Depends(get_current_user)):
    cursor = apps_col.find({"user_id": user["user_id"]}).sort("created_at", -1)
    docs   = await cursor.to_list(length=100)
    return [_serialize(d) for d in docs]


@router.patch("/applications/{app_id}/status")
async def update_status(app_id: str, body: ApplicationStatusUpdate, user=Depends(get_current_user)):
    await apps_col.update_one(
        {"_id": ObjectId(app_id), "user_id": user["user_id"]},
        {"$set": {"status": body.status}}
    )
    return {"message": "Status updated"}


@router.delete("/applications/{app_id}")
async def delete_application(app_id: str, user=Depends(get_current_user)):
    await apps_col.delete_one({"_id": ObjectId(app_id), "user_id": user["user_id"]})
    return {"message": "Deleted"}
