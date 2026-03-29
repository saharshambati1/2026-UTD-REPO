from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # 1. Variables required by main.py
    app_name: str = "Folia API"
    app_version: str = "1.0.0"
    debug: bool = True
    frontend_url: str = "http://localhost:3000"
    sendgrid_api_key: Optional[str] = None

    # 2. Your custom variables
    APP_ENV: str = "dev"
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    RAG_SERVICE_URL: str = ""
    INTERNAL_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

# 3. For files that want to call the function (like main.py)
@lru_cache()
def get_settings():
    return Settings()

# 4. ADD THIS BACK! For files that want the variable directly (like core/auth.py)
settings = get_settings()