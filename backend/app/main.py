from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import match, jobs, auth, resume, applications

app = FastAPI(title="Resume Matcher API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(match.router)
app.include_router(jobs.router)
app.include_router(resume.router)
app.include_router(applications.router)

@app.get("/")
def home():
    return {"message": "Resume Matcher API Running"}
