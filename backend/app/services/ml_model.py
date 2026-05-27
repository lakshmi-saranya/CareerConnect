import joblib
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

MODEL_PATH = "saved_models/logistic_model.pkl"

def train_with_df(df):
    X = df["text"].tolist()
    y = df["label"].tolist()

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=10000)),
        ("clf", LogisticRegression(max_iter=1000))
    ])

    pipeline.fit(X, y)

    os.makedirs("saved_models", exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")

    return pipeline

def load_model():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    return None

def predict(model, text):
    return int(model.predict([text])[0])

def predict_score(model, text):
    """Return match probability as a 0-100 integer score."""
    proba = model.predict_proba([text])[0]
    # proba[1] = probability of class 1 (good match)
    return int(round(proba[1] * 100))
