from datetime import datetime, timedelta, timezone, date
import math
from dateutil.relativedelta import relativedelta
from sqlalchemy import Boolean, Enum, Integer, String, Column, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class Role(str, enum.Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(Role), default=Role.CUSTOMER)
    is_verified = Column(Boolean, default=False)

    # Relationships (if customers have installments)
    installments = relationship("Installment", back_populates="user")

class Installment(Base):
    __tablename__ = "installments"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    total_amount = Column(Integer) # Total amount in cents
    installment_amount = Column(Integer, nullable=True) # Amount to be paid each month in cents
    remaining_amount = Column(Integer) # Remaining amount in cents
    due_date = Column(Date) # Due date of each month
    created_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="installments")
    product = relationship("Product", back_populates="installments")
    payments = relationship("Payment", back_populates="installment")

    @property
    def total_amount_in_bdt(self):
        return self.total_amount / 100.0
    @total_amount_in_bdt.setter
    def total_amount_in_bdt(self, value):
        self.total_amount = int(value * 100)  # Store amount in cents

    @property
    def remaining_amount_in_bdt(self):
        return self.remaining_amount / 100.0
        
    @remaining_amount_in_bdt.setter
    def remaining_amount_in_bdt(self, value):
        self.remaining_amount = int(value * 100)

    @property
    def installment_amount_in_bdt(self):
        return self.installment_amount / 100.0 if self.installment_amount else None
    @installment_amount_in_bdt.setter
    def installment_amount_in_bdt(self, value):
        self.installment_amount = int(value * 100)  # Store amount in cents

    @staticmethod
    def create_due_date(day: int, reference_date: date = None) -> date:
        """Create a date from day-of-month (handles end-of-month)"""
        ref_date = reference_date or date.today()
        
        # Get last day of month
        last_day = (ref_date.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
        safe_day = min(day, last_day.day)
        
        return ref_date.replace(day=safe_day)

    @property
    def next_due_date(self):
        if not self.due_date:
            return None
        return self.due_date + relativedelta(months=1)   
    

    
    def calculate_remaining_amount(self, payments):
        if not payments:
            return self.total_amount
        
        total_payments = sum(payment.amount for payment in payments)
        return max(0, self.total_amount - total_payments)
    
    @staticmethod
    def calculate_installment_amount(remaining_amount, period):
        if period <= 0:
            raise ValueError("Number of months must be greater than zero.")
        return math.ceil(remaining_amount / period)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    price = Column(Integer) # Price in cents

    # Relationships
    installments = relationship("Installment", back_populates="product")

    @property
    def price_in_bdt(self):
        return self.price / 100.0
    
    @price_in_bdt.setter
    def price_in_bdt(self, value):
        self.price = int(value * 100)  # Store price in cents

    
class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True)
    installment_id = Column(Integer, ForeignKey("installments.id"))
    amount = Column(Integer) # Amount in cents
    payment_date = Column(DateTime(timezone=True))

    # Relationships
    installment = relationship("Installment", back_populates="payments")

    @property
    def amount_in_bdt(self):
        return self.amount / 100.0
    
    @amount_in_bdt.setter
    def amount_in_bdt(self, value):
        self.amount = int(value * 100)  # Store amount in cents
