import json
import os
import asyncio
import aiohttp
from fastapi import APIRouter
from huggingface_hub import list_repo_files

router = APIRouter()

REPO_ID    = "netsol/resume-score-details"
BASE_URL   = "https://huggingface.co/datasets/netsol/resume-score-details/resolve/main"
CACHE_FILE = "saved_models/jobs_cache.json"

_jobs_cache = None


async def _fetch_one(session, filename):
    url = f"{BASE_URL}/{filename}"
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=20)) as r:
            if r.status != 200:
                return None
            sample = await r.json(content_type=None)
            inp = sample.get("input", {}) or {}
            out = sample.get("output", {}) or {}

            job_desc = (inp.get("job_description") or "").strip()
            valid    = out.get("valid_resume_and_jd", False)

            if not job_desc or not valid:
                return None

            first_line = job_desc.splitlines()[0].strip()
            title      = first_line[:80] if first_line else "Job Opening"
            personal   = out.get("personal_info") or {}
            company    = (personal.get("current_company") or "Company").strip()

            return {
                "id":               filename,
                "title":            title,
                "company":          company,
                "description":      job_desc[:300] + ("…" if len(job_desc) > 300 else ""),
                "full_description": job_desc,   # ← full text for modal
            }
    except Exception:
        return None


async def _load_jobs_async():
    print("Listing repo files...")
    all_files  = list(list_repo_files(REPO_ID, repo_type="dataset"))
    json_files = [f for f in all_files if f.endswith(".json") and not f.startswith(".")]
    print(f"Downloading {len(json_files)} files in parallel...")

    connector = aiohttp.TCPConnector(limit=20)
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks   = [_fetch_one(session, f) for f in json_files]
        results = await asyncio.gather(*tasks)

    jobs = [r for r in results if r is not None]
    print(f"Loaded {len(jobs)} valid jobs.")
    return jobs


def _load_jobs():
    global _jobs_cache

    if _jobs_cache is not None:
        return _jobs_cache

    if os.path.exists(CACHE_FILE):
        print("Loading jobs from disk cache...")
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            _jobs_cache = json.load(f)
        print(f"Loaded {len(_jobs_cache)} jobs from cache.")
        return _jobs_cache

    jobs = asyncio.run(_load_jobs_async())

    os.makedirs("saved_models", exist_ok=True)
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(jobs, f, ensure_ascii=False)

    _jobs_cache = jobs
    return _jobs_cache


@router.get("/jobs")
def get_jobs():
    return _load_jobs()   # returns full_description now
