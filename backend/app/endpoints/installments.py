from datetime import datetime, timezone, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_async_db
from app.core.security import get_current_user
from app.models.db_models import Installment, Payment, Product, User
from app.models.schemas import InstallmentCreate, InstallmentResponse, PaymentCreate

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
    try:
        # First, create and save the installment
        new_installment = Installment(
            user_id=current_user.id,
            product_id=installment.product_id,
            total_amount=product.price,
            remaining_amount=product.price,  # Initialize remaining amount to full price
            due_date=due_date,
            created_at=datetime.now(timezone.utc)  # Explicitly set timezone-aware datetime
        )
        
        # Add and commit the installment first to get an ID
        db.add(new_installment)
        await db.commit()
        await db.refresh(new_installment)
        
        # Handle initial payment if provided
        if installment.initial_payment and installment.initial_payment > 0.0:
            # Create payment with the now-valid installment_id
            init_payment = Payment(
                installment_id=new_installment.id,
                amount_in_bdt=installment.initial_payment,
                payment_date=datetime.now(timezone.utc)  # Explicitly set timezone-aware datetime
            )
            
            # Add and commit the payment
            db.add(init_payment)
            await db.commit()
            await db.refresh(init_payment)
            
            # Update the remaining amount based on the payment
            new_installment.remaining_amount_in_bdt -= init_payment.amount_in_bdt
        
        # Calculate the installment amount based on the remaining amount
        new_installment.installment_amount = Installment.calculate_installment_amount(
            new_installment.remaining_amount, 
            installment.period_of_installment
        )
        
        # Update due date if needed
        if due_date.month == date.today().month:
            new_installment.due_date = new_installment.next_due_date
        
        # Commit the updated installment
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
    except Exception as e:
        # Rollback the session in case of an error
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create installment") from e
    

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
    try:
        # Get the installment
        result = await db.execute(
            select(Installment)
            .where(Installment.id == installment_id, Installment.user_id == current_user.id)
        )
        installment = result.scalars().first()
        
        if not installment:
            raise HTTPException(status_code=404, detail="Installment not found")
        
        # Get all existing payments for this installment
        payments_result = await db.execute(
            select(Payment).where(Payment.installment_id == installment_id)
        )
        existing_payments = payments_result.scalars().all()
        
        # Calculate total paid so far
        total_paid = sum(p.amount_in_bdt for p in existing_payments)
        
        # Calculate actual remaining amount (not rounded)
        actual_remaining = installment.total_amount_in_bdt - total_paid
        
        # Handle the final payment case - adjust payment amount if it would cause overpayment
        if payment.amount > actual_remaining:
            raise HTTPException(status_code=400, detail="Payment exceeds remaining amount")
        
        # For the final payment, allow an amount that's less than the installment amount
        # but equal to the actual remaining amount
        is_final_payment = abs(actual_remaining - payment.amount) < 0.01
        
        if not is_final_payment and payment.amount < installment.installment_amount_in_bdt:
            raise HTTPException(status_code=400, detail="Payment is less than the installment amount")

        # Create new payment
        new_payment = Payment(
            installment_id=installment_id,
            amount_in_bdt=payment.amount,
            payment_date=datetime.now(timezone.utc)
        )
        
        # Add payment to database
        db.add(new_payment)
        await db.commit()
        await db.refresh(new_payment)
        
        # Get updated list of all payments including the new one
        payments_result = await db.execute(
            select(Payment).where(Payment.installment_id == installment_id)
        )
        all_payments = payments_result.scalars().all()
        
        # Update remaining amount on installment using the calculation method
        installment.remaining_amount = installment.calculate_remaining_amount(all_payments)
        
        # If this was the final payment (remaining amount is 0), no need to update due date
        if installment.remaining_amount > 0:
            installment.due_date = installment.next_due_date
        
        # Commit the changes
        await db.commit()
        await db.refresh(installment)
        
        return {
            "message": "Payment successful",
            "payment_amount": new_payment.amount_in_bdt,
            "installment_id": installment_id,
            "remaining_amount": installment.remaining_amount_in_bdt,
            "payment_date": new_payment.payment_date,
        }
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Rollback the session in case of an error
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to process payment: {str(e)}") from e
