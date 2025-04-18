from pydantic import BaseModel, Field, EmailStr, field_validator, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, date
from enum import Enum

# auth schemas
class UserRole(str, Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"

class UserRegister(BaseModel):
    email: EmailStr
    name: Optional[str] = None
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

class ProductResponse(BaseModel):
    id: int
    name: str
    price_in_bdt: float

    class Config:
        from_attributes = True

# payment schemas
class PaymentCreate(BaseModel):
    amount_in_bdt: float
    installment_id: int
    payment_date: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

class PaymentResponse(BaseModel):
    id: int
    installment_id: int
    amount_in_bdt: float
    payment_date: datetime

    class Config:
        from_attributes = True

# installment schemas
class InstallmentCreate(BaseModel):
    product_id: int
    # user_id: int  # Not needed for now, but can be added if needed
    # total_amount: float
    initial_payment: Optional[float] = None
    period_of_installment: int = Field(gt=0, le=12, description="Number of months for installment")
    due_day: int # 1-31
    
    
class InstallmentResponse(BaseModel):
    id: int
    total_amount: float
    remaining_amount: float
    due_date: date
    product_id: int

    class Config:
        from_attributes = True


# admin schemas
class ReportResponse(BaseModel):
    report_type: str
    start_date: date
    end_date: date
    total_paid: float
    total_due: float
    year: Optional[int] = None
    period: Optional[int] = None

    class Config:
        from_attributes = True

# Schema for pagination information
class PaginationInfo(BaseModel):
    total: int
    page: int
    limit: int
    pages: int

# Schema for payment details in reports
class PaymentDetail(BaseModel):
    id: int
    amount: float
    payment_date: datetime
    installment_id: int
    user_name: str
    user_email: str

# Schema for paginated report response
class PaginatedReportResponse(ReportResponse):
    payments: List[Dict[str, Any]]
    pagination: PaginationInfo

# Schema for paginated payment response
class PaginatedPaymentResponse(BaseModel):
    items: List[PaymentResponse]
    pagination: PaginationInfo
    
    class Config:
        from_attributes = True

# Schema for paginated installment response
class PaginatedInstallmentResponse(BaseModel):
    items: List[InstallmentResponse]
    pagination: PaginationInfo

    class Config:
        from_attributes = True