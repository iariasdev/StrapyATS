from pydantic_settings import BaseSettings  # type: ignore
from typing import List, Optional
import os


class Settings(BaseSettings):
    PROJECT_NAME: str = "StrapyATS API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # Google AI Studio / Gemini API Key
    GOOGLE_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # Langfuse Observability
    LANGFUSE_PUBLIC_KEY: str = ""
    LANGFUSE_SECRET_KEY: str = ""
    LANGFUSE_HOST: str = "https://cloud.langfuse.com"

    # App Environment & Limits
    ENVIRONMENT: str = "development"
    MAX_REQUESTS_PER_IP_PER_DAY: int = 2
    CHROMA_PERSIST_PATH: str = "./chroma_db"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://strapyats.vercel.app",
        "chrome-extension://*",
    ]

    def get_effective_google_api_key(self, byok_key: Optional[str] = None) -> str:
        """Returns BYOK key if provided, otherwise the global backend GOOGLE_API_KEY."""
        if byok_key and byok_key.strip():
            return byok_key.strip()
        return self.GOOGLE_API_KEY.strip()

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
