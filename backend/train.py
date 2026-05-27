import sys
import os

# Ensure the backend root is on the path when running as a script
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.train_data_loader import load_resume_dataset
from app.services.ml_model import train_with_df

def main():
    print("Loading dataset from Hugging Face (this may take a moment)...")
    df = load_resume_dataset()
    print(f"Loaded {len(df)} samples. Training model...")
    model = train_with_df(df)
    print("✅ Model trained and saved successfully.")

if __name__ == "__main__":
    main()
