from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import MONGO_URL, DB_NAME

client = AsyncIOMotorClient(MONGO_URL)
database = client[DB_NAME]

resume_collection = database.get_collection("resumes")
job_collection    = database.get_collection("jobs")
users_collection  = database.get_collection("users")
