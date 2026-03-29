from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # 1. System Settings
    app_name: str = "Folia API"
    app_version: str = "1.0.0"
    debug: bool = True
    frontend_url: str = "http://localhost:3000"
    
    # 2. Database & Auth (Converted to lowercase to fix the error)
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""

    # 3. RAG & External Services
    rag_service_url: str = ""
    internal_api_key: str = ""
    sendgrid_api_key: Optional[str] = None
    
    app_env: str = "dev"

    # This tells Pydantic to look for both lowercase and uppercase in your .env file
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()