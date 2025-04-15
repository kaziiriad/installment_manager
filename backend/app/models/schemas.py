from pydantic import BaseModel, Field, EmailStr, field_validator, validator
from typing import Optional, List
from datetime import datetime, timezone, date
from enum import Enum

# auth schemas
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


# payment schemas
class PaymentCreate(BaseModel):
    amount: float

class PaymentResponse(BaseModel):
    id: int
    amount: float
    payment_date: datetime

    class Config:
        from_attributes = True

# installment schemas
class InstallmentCreate(BaseModel):
    product_id: int
    # total_amount: float
    due_day: int # 1-31
    
    
class InstallmentResponse(BaseModel):
    id: int
    total_amount: float
    remaining_amount: float
    due_date: date
    product_id: int

    class Config:
        from_attributes = True
