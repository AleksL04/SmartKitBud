import os
from dotenv import load_dotenv

load_dotenv()

OCR_API_KEY: str = os.environ.get("OCR_API_KEY")
GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY")
SUPABASE_URL: str = os.environ.get("SUPABASE_URL")
SUPABASE_KEY: str = os.environ.get("SUPABASE_KEY")
UPLOAD_DIR: str = "uploads"