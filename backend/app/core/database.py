from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from .config import settings
from typing import Generator, AsyncGenerator
import re



# Convert synchronous PostgreSQL URL to async format
def get_async_database_url() -> str:
    """Convert standard PostgreSQL URL to AsyncPG compatible URL"""
    db_url = settings.DATABASE_URL
    if db_url.startswith('postgresql://'):
        return re.sub(r'^postgresql:\/\/', 'postgresql+asyncpg://', db_url)
    return db_url

# Create async SQLAlchemy engine
async_engine = create_async_engine(
    get_async_database_url(),
    echo=False,  # Set to True for SQL query logging
    future=True,
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    async_engine, 
    class_=AsyncSession, 
    expire_on_commit=False,
    autocommit=False, 
    autoflush=False,
)

# Create synchronous SQLAlchemy engine for backward compatibility
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Async dependency to get DB session
async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Async dependency function that yields a SQLAlchemy async session
    and ensures it's closed after use
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Synchronous dependency to get DB session (for backward compatibility)
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

# Async function to create all tables in the database
async def create_tables_async() -> None:
    """Create all tables defined in models asynchronously"""
    async with async_engine.begin() as conn:
        # Import all models here to ensure they're registered with Base
        # This avoids circular imports
        from models.db_models import User, Product, Installment, Payment
        
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
        
        print("All tables created successfully!")

# Function to create all tables in the database (synchronous version)
def create_tables() -> None:
    """Create all tables defined in models"""
    Base.metadata.create_all(bind=engine)
