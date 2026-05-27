# app/train_data_loader.py

import json
import pandas as pd
import requests
from huggingface_hub import list_repo_files

BASE_URL = "https://huggingface.co/datasets/netsol/resume-score-details/resolve/main"
REPO_ID  = "netsol/resume-score-details"


def load_resume_dataset():
    print("Listing files in HuggingFace repo...")

    # Get all .json filenames in the repo
    all_files = list(list_repo_files(REPO_ID, repo_type="dataset"))
    json_files = [f for f in all_files if f.endswith(".json") and not f.startswith(".")]

    print(f"Found {len(json_files)} JSON files. Downloading...")

    texts  = []
    labels = []
    errors = 0

    for filename in json_files:
        url = f"{BASE_URL}/{filename}"
        try:
            r = requests.get(url, timeout=30)
            r.raise_for_status()
            sample = r.json()

            inp = sample.get("input", {})
            out = sample.get("output", {})

            resume = (inp.get("resume") or "").strip()
            job    = (inp.get("job_description") or "").strip()
            valid  = out.get("valid_resume_and_jd", False)

            if not resume or not job:
                continue

            texts.append(resume + " " + job)
            labels.append(1 if valid else 0)

        except Exception as e:
            errors += 1
            continue

    print(f"Loaded {len(texts)} samples ({errors} skipped).")

    if not texts:
        raise ValueError("No samples loaded. Check your internet connection.")

    return pd.DataFrame({"text": texts, "label": labels})