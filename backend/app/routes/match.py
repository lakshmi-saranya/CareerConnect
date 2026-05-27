from fastapi import APIRouter, Depends
from app.models.schemas import MatchRequest
from app.services.ml_model import load_model, predict_score
from app.services.preprocessing import clean_text
from app.routes.auth import get_current_user

router = APIRouter()

@router.post("/match")
async def match_resume(request: MatchRequest, user=Depends(get_current_user)):
    model = load_model()
    if not model:
        return {"error": "Model not trained yet. Please run train.py first."}

    combined_text = clean_text(request.resume_text + " " + request.job_text)
    score = predict_score(model, combined_text)

    return {
        "match_score":  score,
        "match_result": 1 if score >= 50 else 0,
        "user_id":      user["user_id"],
    }
