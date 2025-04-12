from sqlalchemy import Enum, Integer, String, Column, Float, DateTime, ForeignKey
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
    email = Column(String(255))
    role = Column(Enum(Role), default=Role.CUSTOMER.value)

    # Relationships
    installments = relationship("Installment", back_populates="users")

class Installment(Base):
    __tablename__ = "installments"
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    total_amount = Column(Float)
    remaining_amount = Column(Float)
    due_date = Column(DateTime)

    # Relationships
    customer = relationship("Customer", back_populates="installments")
    product = relationship("Product", back_populates="installments")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    price = Column(Float)

    # Relationships
    installments = relationship("Installment", back_populates="products")

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True)
    installment_id = Column(Integer, ForeignKey("installments.id"))
    amount = Column(Float)
    payment_date = Column(DateTime)

    # Relationships
    installment = relationship("Installment", back_populates="payments")
