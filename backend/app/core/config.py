from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "Farming Assist"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Security & JWT
    SECRET_KEY: str = "krishi-khata-super-secret-key-change-in-production-2026-xyz"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Database
    # Defaults to async SQLite for local/offline resilience; override with PostgreSQL async URL:
    # postgresql+asyncpg://postgres:postgres@localhost:5432/krishi_khata
    DATABASE_URL: str = f"sqlite+aiosqlite:///{(BASE_DIR / 'krishi_khata.db').as_posix()}"

    # AI & Vision
    GEMINI_API_KEY: str = ""

    # Mandi & Weather
    DATAGOV_API_KEY: str = ""
    MANDI_CACHE_TTL_HOURS: int = 12

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # File uploads
    UPLOAD_DIR: str = str(BASE_DIR / "uploads" / "drone_images")

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
