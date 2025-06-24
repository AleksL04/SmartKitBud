import os
from dotenv import load_dotenv

load_dotenv()

OCR_API_KEY: str = os.environ.get("OCR_API_KEY")
GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY")