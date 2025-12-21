"""
Application configuration
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os

class Settings(BaseSettings):
    # API Settings
    api_v1_str: str = "/api"
    project_name: str = "Open Coding Evaluation Platform"

    # Server
    backend_cors_origins: str = "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176"

    @property
    def cors_origins(self) -> list[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]

    # MongoDB
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "eval_platform"

    # Redis
    redis_url: str = "redis://localhost:6379"
    redis_db: int = 0

    # Clerk Authentication
    clerk_frontend_api_url: Optional[str] = None
    clerk_backend_api_key: Optional[str] = None
    clerk_webhook_secret: Optional[str] = None

    # Security
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Pagination
    default_page_size: int = 50
    max_page_size: int = 100

    # File Upload
    max_upload_size: int = 10 * 1024 * 1024  # 10MB
    allowed_upload_extensions: list[str] = [".csv"]

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )

# Create settings instance
settings = Settings()