from pydantic import EmailStr
from sqlalchemy import select
from .database import AsyncSessionLocal, SessionLocal
from models.db_models import User, Role
from .security import get_password_hash
from .config import settings

async def create_admin(admin_email: EmailStr):
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).filter(User.email == admin_email))
        admin = result.scalars().first()
        
        if not admin:
            admin = User(
                email=admin_email,
                hashed_password=get_password_hash("admin_password"),
                role=Role.ADMIN,
                is_verified=True
            )
            db.add(admin)
            await db.commit()
        elif admin.role != Role.ADMIN:
            admin.role = Role.ADMIN
            await db.commit()