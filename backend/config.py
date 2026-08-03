import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "calibo_ai_solution_architect_secret_key_2026_super_secure")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./solution_architect.db")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
