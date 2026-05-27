# CareerConnect

An intelligent job application platform that matches your resume to real job listings using a hybrid ML + keyword scoring engine, auto-generates cover letters, and tracks your applications — all in one place.

---

## Features

- **Google OAuth Login** — secure, one-click authentication
- **Resume Upload & Parsing** — paste or upload your resume; text is stored to your profile
- **Hybrid Job Matching** — combines TF-IDF + Logistic Regression ML scoring with keyword overlap scoring for accurate, real-time match percentages
- **Live Job Listings** — pulls real job descriptions from a HuggingFace dataset with local disk caching for fast repeat loads
- **Cover Letter Generator** — auto-generates a personalized cover letter for any job with one click; fully editable before submitting
- **Application Tracker** — save drafts or submit applications, track status (Pending / Submitted / Accepted / Rejected)
- **Dashboard** — overview of all your applications with status breakdown at a glance

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Context API |
| Backend | FastAPI (Python), Uvicorn |
| Database | MongoDB (via Motor async driver) |
| ML Model | Scikit-learn — TF-IDF Vectorizer + Logistic Regression Pipeline |
| Auth | Google OAuth 2.0 + JWT |
| Job Data | HuggingFace Datasets (`netsol/resume-score-details`) |

---

## How the Matching Works

When you upload your resume, CareerConnect runs two scoring methods in parallel:

1. **Keyword Score** — extracts skills from your resume and checks how many appear in each job description (covers 80+ skills across tech, business, marketing, finance, and engineering domains)
2. **ML Score** — feeds the combined resume + job text into a trained Logistic Regression model that returns a match probability

The final score shown is the average of both. Scores update live on the page as the ML model processes jobs in batches of 5.

---

## Project Structure

```
career-connect/
├── backend/
│   ├── app/
│   │   ├── core/         # Config (env vars)
│   │   ├── database/     # MongoDB connection
│   │   ├── models/       # Pydantic schemas
│   │   ├── routes/       # API endpoints (auth, jobs, match, resume, applications)
│   │   ├── services/     # ML model loading + text preprocessing
│   │   └── main.py       # FastAPI app entry point
│   ├── saved_models/     # Trained model (.pkl) — not committed to git
│   ├── train.py          # Script to retrain the ML model
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # Header, Sidebar, Layout, JobCard, etc.
│   │   ├── context/      # AuthContext (global user state)
│   │   ├── pages/        # Dashboard, Login, JobMatches, Draft, Applications, UploadResume
│   │   └── services/     # API fetch wrapper
│   └── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB (local or Atlas)
- A Google OAuth Client ID ([create one here](https://console.cloud.google.com/))

### 1. Clone the repo

```bash
git clone https://github.com/lakshmi-saranya/CareerConnect.git
cd CareerConnect
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder:

```env
MONGO_URI=your_mongodb_connection_string
DB_NAME=careerconnect
GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET=your_secret_key
```

Train the ML model (first time only):

```bash
python train.py
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`

### 3. Frontend setup

```bash
cd frontend
npm install
```

Update your Google Client ID in `src/App.jsx` (or move to a `.env` file):

```js
const GOOGLE_CLIENT_ID = "your_google_client_id";
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Environment Variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `DB_NAME` | Database name (e.g. `careerconnect`) |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `JWT_SECRET` | Any random secret string for signing JWTs |

---

## Screenshots

> _Coming soon — dashboard, job matches, cover letter editor_

---

## Future Improvements

- Resume PDF upload and automatic text extraction
- Email notifications on application status change
- Smarter cover letter generation using an LLM
- Filter jobs by domain, location, or score threshold
- Deploy to Vercel (frontend) + Render (backend)
