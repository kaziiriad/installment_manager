from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_async_db
from core.security import create_access_token, verify_password, get_password_hash
from core.otp import create_otp, verify_otp
from models.schemas import OTPResponse, OTPVerify, UserRegister, UserResponse, Token
from models.db_models import User
from services.email import send_email

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

@auth_router.post("/register")
async def register(user: UserRegister, db: AsyncSession = Depends(get_async_db)):
    existing_user = await db.execute(select(User).where(User.email == user.email))
    if existing_user.scalar():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email already registered"
        )

    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        is_verified=False
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Generate OTP and send it to the user
    response = await create_otp(new_user.email)
    send_email(
        to_email=new_user.email,
        subject="Verify your email",
        content=f"Your OTP is {response.otp}. It will expire in {response.expiry_duration} minutes."
    )

    return {
        "email": new_user.email,
        "message" : "User registered successfully. Please verify your email. OTP sent.",
        "otp expiry time": response.expiry_duration
    }
@auth_router.post("/verify-otp", response_model=UserResponse)
async def verify_otp_endpoint(otp_data: OTPVerify, db: AsyncSession = Depends(get_async_db)):
    if not verify_otp(otp_data.email, otp_data.otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )
    
    result = await db.execute(select(User).where(User.email == otp_data.email and User.is_verified is False))
    existing_user = result.scalar()
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found"
        )

    # Assuming OTP verification logic here
    # If OTP is valid, update the user record
    existing_user.is_verified = True
    await db.commit()
    await db.refresh(existing_user)

    return existing_user



@auth_router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

