from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import EmailStr
from app.core.database import get_async_db
from app.core.security import create_access_token, verify_password, get_password_hash, get_current_user_without_verification, get_current_user
from app.core.otp import create_otp, verify_otp
from app.models.schemas import OTPResponse, OTPVerify, UserRegister, UserResponse, Token
from app.models.db_models import User
from app.services.email import send_email, send_otp_email

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
        name=user.name if user.name else "",
        email=user.email,
        hashed_password=hashed_password,
        is_verified=False
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Generate OTP and send it to the user
    response = await create_otp(new_user.email)
    send_otp_email(
        to_email=new_user.email,
        otp=response.otp
    )

    return {
        "email": new_user.email,
        "message" : "User registered successfully. Please verify your email. OTP sent.",
        "otp expiry time": response.expiry_duration
    }
    
@auth_router.post("/resend-otp")
async def resend_otp_endpoint(
    email: EmailStr,
    db: AsyncSession = Depends(get_async_db)):
    """
    Resend OTP to the user's email.
    This endpoint requires authentication but works for unverified users.
    """
    # Check if user is already verified
    result = await db.execute(select(User).where(User.email == email and User.is_verified is False))
    current_user = result.scalar()
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found or already verified"
        )
    # Generate a new OTP
    response = await create_otp(current_user.email)
    
    # Send the OTP via email
    email_response = send_otp_email(
        to_email=current_user.email,
        otp=response.otp
    )
    
    if not email_response or getattr(email_response, 'status_code', 500) >= 400:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP email"
        )
    
    return {
        "message": f"OTP sent to {current_user.email}",
        "status_code": getattr(email_response, 'status_code', 202),
        "expires_in": f"{response.expiry_duration} minutes"
    }


@auth_router.post("/verify-otp", response_model=UserResponse)
async def verify_otp_endpoint(otp_data: OTPVerify, db: AsyncSession = Depends(get_async_db)):
    if not await verify_otp(otp_data.email, otp_data.otp):
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

@auth_router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user