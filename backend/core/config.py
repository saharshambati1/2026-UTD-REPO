from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from dotenv import load_dotenv
 # Load environment variables from .env file
load_dotenv()
from functools import lru_cache
from typing import Optional
class Settings(BaseSettings):
    # 1. Variables required by main.py
    app_name: str = "Folia API"
    app_version: str = "1.0.0"
    debug: bool = True
    frontend_url: str = "http://localhost:3000"
    sendgrid_api_key: Optional[str] = None
    SUPABASE_URL: str = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_ANON_KEY")

    # OpenAI and LLM configurations
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")


    # Google OAuth
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID")


    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

# 3. For files that want to call the function (like main.py)
@lru_cache()
def get_settings():
    return Settings()

# 4. ADD THIS BACK! For files that want the variable directly (like core/auth.py)
settings = get_settings()