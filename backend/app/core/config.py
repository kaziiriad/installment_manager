from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv("/mnt/c/Users/Sultan Mahmud/Desktop/innovative_internship_test/backend/.env")

class Settings(BaseSettings):
    """Application settings"""
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://myuser:mypassword@localhost:5432/installment_db")
    
    REDIS_URL_CACHE: str = os.getenv("REDIS_URL_CACHE", "redis://localhost:6379/0")
    REDIS_URL_QUEUE: str = os.getenv("REDIS_URL_QUEUE", "redis://localhost:6379/1")
    
    # JWT settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-jwt-secret-key-for-development-only")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRATION: int = int(os.getenv("JWT_EXPIRATION", "30"))

    # Application settings
    APP_NAME: str = "Installment Management System"
    API_V1_STR: str = "/api/v1"
        
    # Email settings
    SENDGRID_API_KEY: str = os.getenv("SENDGRID_API_KEY", "")
    EMAIL_SENDER: str = os.getenv("EMAIL_SENDER", "noreply@yourdomain.com")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()
