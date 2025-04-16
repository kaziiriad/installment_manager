from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

class Settings(BaseSettings):
    """Application settings"""
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://myuser:mypassword@localhost:5432/installment_db")
    
    REDIS_URL_CACHE: str = os.getenv("REDIS_URL_CACHE", "redis://localhost:6379/0")
    REDIS_URL_QUEUE: str = os.getenv("REDIS_URL_QUEUE", "redis://localhost:6379/1")
    
    # JWT settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-jwt-secret-key-for-development-only")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your_jwt_secret_key")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRATION_TIME: int = int(os.getenv("JWT_EXPIRATION_TIME", "3600"))

    # Application settings
    APP_NAME: str = "Installment Management System"
    API_V1_STR: str = "/api/v1"
    API_V_STR: str = "/api/v1"  # Alternative API version string
        
    # Email settings
    SENDGRID_API_KEY: str = os.getenv("SENDGRID_API_KEY", "")
    EMAIL_SENDER: str = os.getenv("EMAIL_SENDER", "noreply@yourdomain.com")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # SMTP settings    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Allow extra fields from environment variables

# Create settings instance
settings = Settings()
