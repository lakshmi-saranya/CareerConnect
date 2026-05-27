import re

def clean_text(text: str):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z ]', '', text)
    return text
