from .base import SessionLocal
from .models.user import User, Role
from ..core.security import get_password_hash

def create_admin():
    db = SessionLocal()
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = User(
            email="admin@example.com",
            hashed_password=get_password_hash("admin_password"),
            role=Role.ADMIN,
            is_verified=True  # Skip OTP for admin
        )
        db.add(admin)
        db.commit()