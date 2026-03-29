from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from dotenv import load_dotenv
 # Load environment variables from .env file
load_dotenv()
class Settings(BaseSettings):
    APP_NAME: str = "Startup Feature Backend"
    APP_ENV: str = "dev"

    SUPABASE_URL: str = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_ANON_KEY")

    # OpenAI and LLM configurations
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")

    #

    # Google OAuth
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()