from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class OTPResponse(BaseModel):
    email: EmailStr
    otp: str
    expiry_duration: int = Field(default=5, description="OTP expiry duration in minutes")

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: UserRole
    is_verified: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class PaymentCreate(BaseModel):
    amount: int  # in cents
    currency: str = "usd"
