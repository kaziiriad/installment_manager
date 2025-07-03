from pydantic import EmailStr
from sqlalchemy import select
from .database import AsyncSessionLocal, SessionLocal
from app.models.db_models import User, Role, Product
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

async def seed_products():
    async with AsyncSessionLocal() as db:
        # Check if products already exist
        result = await db.execute(select(Product))
        existing_products = result.scalars().all()
        
        if not existing_products:
            # Sample products for the installment system
            products = [
                Product(
                    name="iPhone 15 Pro",
                    price=99900  # Price in cents
                ),
                Product(
                    name="MacBook Air M2",
                    price=119900  # Price in cents
                ),
                Product(
                    name="iPad Pro 12.9",
                    price=109900  # Price in cents
                ),
                Product(
                    name="Apple Watch Series 9",
                    price=39900  # Price in cents
                ),
                Product(
                    name="AirPods Pro",
                    price=24900  # Price in cents
                ),
            ]
            
            for product in products:
                db.add(product)
            
            await db.commit()
            print(f"Added {len(products)} products to database")