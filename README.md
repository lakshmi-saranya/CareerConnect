# CareerConnect — Resume Matcher

A full-stack job matching app: React + FastAPI + MongoDB + scikit-learn.

---

## 🚀 Setup & Run

### 1. Backend

```bash
cd resumer-matcher-backend

# Install dependencies
pip install -r requirements.txt

# Train the ML model (downloads dataset from Hugging Face)
python train.py

# Start the API server
uvicorn app.main:app --reload
# → Runs on http://localhost:8000
```

**Make sure MongoDB is running locally:**
```bash
mongod --dbpath /data/db
```
Or update `.env` with your MongoDB Atlas URI.

---

### 2. Frontend

```bash
cd resume-match

# Install dependencies
npm install

# Start dev server
npm run dev
# → Runs on http://localhost:5173
```

---

## 📁 Project Structure

```
resumer-matcher-backend/
├── app/
│   ├── core/config.py          # Env vars
│   ├── database/mongodb.py     # MongoDB connection
│   ├── models/schemas.py       # Pydantic schemas
│   ├── routes/match.py         # POST /match endpoint
│   ├── services/
│   │   ├── ml_model.py         # Train/load/predict
│   │   └── preprocessing.py    # Text cleaning
│   ├── main.py                 # FastAPI app + CORS
│   └── train_data_loader.py    # HuggingFace dataset loader
├── train.py                    # Run to train model
├── requirements.txt
└── .env                        # MONGO_URL, DB_NAME

resume-match/
├── src/
│   ├── App.jsx                 # Routes
│   ├── main.jsx                # Entry point
│   ├── pages/                  # Dashboard, Upload, Jobs, Draft, Applications
│   ├── components/             # Layout, Header, Sidebar, JobCard, etc.
│   ├── styles/                 # global.css, components.css
│   └── services/               # API helpers (axios)
├── package.json
└── vite.config.js
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/`      | Health check |
| POST   | `/match` | Match resume text to job description |

**POST `/match` body:**
```json
{
  "resume_text": "Python developer with 3 years experience...",
  "job_text": "Looking for Python backend engineer..."
}
```

**Response:**
```json
{
  "match_score": 78,
  "match_result": 1
}
```
