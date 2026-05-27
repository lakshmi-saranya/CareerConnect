from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.models.schemas import GoogleAuthRequest, UserOut
from app.database.mongodb import users_collection
from app.core.config import GOOGLE_CLIENT_ID, JWT_SECRET
import jwt
import datetime

router  = APIRouter()
security = HTTPBearer()

# ── Google token verify + issue JWT ───────────────────────────────────────
@router.post("/auth/google", response_model=UserOut)
async def google_auth(body: GoogleAuthRequest):
    try:
        info = id_token.verify_oauth2_token(
            body.token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {e}")

    google_id = info["sub"]
    email     = info["email"]
    name      = info.get("name", "")
    picture   = info.get("picture", "")

    # Upsert user in MongoDB
    await users_collection.update_one(
        {"google_id": google_id},
        {"$set": {
            "google_id": google_id,
            "email":     email,
            "name":      name,
            "picture":   picture,
        }},
        upsert=True
    )

    user = await users_collection.find_one({"google_id": google_id})
    user_id = str(user["_id"])

    # Issue JWT
    payload = {
        "user_id": user_id,
        "email":   email,
        "name":    name,
        "exp":     datetime.datetime.utcnow() + datetime.timedelta(days=7),
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    return UserOut(
        user_id=user_id,
        email=email,
        name=name,
        picture=picture,
        access_token=token,
    )


# ── Dependency: get current user from JWT ────────────────────────────────
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
