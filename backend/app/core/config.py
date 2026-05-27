from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL        = os.getenv("MONGO_URL")
DB_NAME          = os.getenv("DB_NAME")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
JWT_SECRET       = os.getenv("JWT_SECRET", "change-this-secret-in-production")
