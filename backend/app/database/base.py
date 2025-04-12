from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from core.config import settings
from typing import Generator

# Create SQLAlchemy engine
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db() -> Generator[Session, None, None]:
    """
    Dependency function that yields a SQLAlchemy session
    and ensures it's closed after use
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to create all tables in the database
def create_tables() -> None:
    """Create all tables defined in models"""
    Base.metadata.create_all(bind=engine)
