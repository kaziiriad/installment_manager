from sqlalchemy import Boolean, Enum, Integer, String, Column, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base
import enum

class Role(str, enum.Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(255))
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
    remaining_amount = Column(Integer) # Remaining amount in cents
    due_date = Column(DateTime)

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

    @staticmethod
    def calculate_remaining_amount(total_amount, payments):
        total_payments = sum(payment.amount for payment in payments)
        return total_amount - total_payments
    


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
    payment_date = Column(DateTime)

    # Relationships
    installment = relationship("Installment", back_populates="payments")

    @property
    def amount_in_bdt(self):
        return self.amount / 100.0
    
    @amount_in_bdt.setter
    def amount_in_bdt(self, value):
        self.amount = int(value * 100)  # Store amount in cents
