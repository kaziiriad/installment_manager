from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

class Settings(BaseSettings):
    """Application settings"""
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://myuser:mypassword@localhost:5432/installment_db")
    
    # Application settings
    # APP_NAME: str = "Installment Management System"
    # API_V1_STR: str = "/api/v1"
    
    # Security settings
    # SECRET_KEY: str
    # SMTP_PASSWORD: str
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()
