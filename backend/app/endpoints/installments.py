from datetime import datetime, timezone, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_async_db
from models.db_models import Installment, Payment, Product, User
from models.schemas import InstallmentCreate, InstallmentResponse, PaymentCreate
from core.security import get_current_user

installment_router = APIRouter(tags=["Installments"])

@installment_router.post("/installments", response_model=InstallmentResponse)
async def create_installment(
    installment: InstallmentCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    
    result = await db.execute(select(Product).where(Product.id == installment.product_id))
    product = result.scalars().first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    due_date = Installment.create_due_date(installment.due_day)
    # Create new installment
    new_installment = Installment(
        user_id=current_user.id,
        product_id=installment.product_id,
        total_amount=product.price,
        remaining_amount=product.price,  # Initialize remaining amount to full price
        due_date=due_date,
        created_at=datetime.now(timezone.utc)  # Explicitly set timezone-aware datetime
    )
    # Set the due date for the first installment
    if due_date.month == date.today().month:
        new_installment.due_date = new_installment.next_due_date
    
    db.add(new_installment)
    await db.commit()
    await db.refresh(new_installment)
    
    # Return the created installment
    return InstallmentResponse(
        id=new_installment.id,
        user_id=new_installment.user_id,
        product_id=new_installment.product_id,
        total_amount=new_installment.total_amount_in_bdt,
        remaining_amount=new_installment.remaining_amount_in_bdt,
        due_date=new_installment.due_date
    )

@installment_router.get("/installments", response_model=list[InstallmentResponse])
async def get_user_installments(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    # Get all installments for the current user
    result = await db.execute(
        select(Installment)
        .where(Installment.user_id == current_user.id)
        .order_by(Installment.due_date)
    )
    installments = result.scalars().all()
    
    # Return a list of InstallmentResponse objects directly
    return [
        {
            "id": installment.id,
            "user_id": installment.user_id,
            "product_id": installment.product_id,
            "total_amount": installment.total_amount_in_bdt,
            "remaining_amount": installment.remaining_amount_in_bdt,
            "due_date": installment.due_date
        }
        for installment in installments
    ]

@installment_router.post("/installments/{installment_id}/payments")
async def create_payment(
    installment_id: int,
    payment: PaymentCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    # Get the installment
    result = await db.execute(
        select(Installment)
        .where(Installment.id == installment_id, Installment.user_id == current_user.id)
    )
    installment = result.scalars().first()
    
    if not installment:
        raise HTTPException(status_code=404, detail="Installment not found")
    
    # Check if payment amount exceeds remaining amount
    if payment.amount > installment.remaining_amount_in_bdt:
        raise HTTPException(status_code=400, detail="Payment exceeds remaining amount")
    
    # Create new payment
    new_payment = Payment(
        installment_id=installment_id,
        amount_in_bdt=payment.amount,
        payment_date=datetime.now(timezone.utc)  # Explicitly set timezone-aware datetime
    )
    
    # Add payment to database
    db.add(new_payment)
    
    # Update remaining amount on installment
    installment.remaining_amount -= new_payment.amount
    if installment.remaining_amount > 0:
        installment.due_date = installment.next_due_date
    
    # Commit the changes
    await db.commit()
    
    # Refresh the payment object to get its ID and other DB-generated values
    await db.refresh(new_payment)
    
    return {
        "message": "Payment successful",
        "payment_amount": new_payment.amount_in_bdt,
        "installment_id": installment_id,
        "remaining_amount": installment.remaining_amount_in_bdt,
        "payment_date": new_payment.payment_date,
    }
