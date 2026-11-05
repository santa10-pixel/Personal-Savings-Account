import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "CampusOS"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./campusos.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "campusos-insecure-dev-secret-key-change-in-production-2026")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "campusos-jwt-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours for dev ease
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    DEFAULT_TIMEZONE: str = "Asia/Kolkata"

    # Integration credentials (optional)
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")

    MICROSOFT_CLIENT_ID: str = os.getenv("MICROSOFT_CLIENT_ID", "")
    MICROSOFT_CLIENT_SECRET: str = os.getenv("MICROSOFT_CLIENT_SECRET", "")
    MICROSOFT_TENANT_ID: str = os.getenv("MICROSOFT_TENANT_ID", "common")

    MOODLE_BASE_URL: str = os.getenv("MOODLE_BASE_URL", "https://lms.vit.ac.in")
    MOODLE_API_TOKEN: str = os.getenv("MOODLE_API_TOKEN", "")

    # Notifications & Email
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "CampusOS Reminders <reminders@campusos.vit.ac.in>")
    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")

    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000")

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:5173"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
