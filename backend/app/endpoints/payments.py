from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime, timezone, date
from app.models.db_models import Payment, Installment, User
from app.models.schemas import PaymentCreate, PaymentResponse, PaginatedPaymentResponse
from app.core.database import get_async_db
from app.core.security import get_current_user

payment_router = APIRouter(prefix="/payments", tags=["Payments"])


@payment_router.get("/", response_model=PaginatedPaymentResponse)
async def get_payments(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user),
    page: int = 1,
    limit: int = 10
):
    """
    Get paginated list of payments for the current user
    """
    try:
        # Calculate offset based on page and limit
        offset = (page - 1) * limit
        
        # Get payments for the current user with pagination
        result = await db.execute(
            select(Payment)
            .join(Installment, Payment.installment_id == Installment.id)
            .where(Installment.user_id == current_user.id)
            .order_by(Payment.payment_date.desc())  # Most recent payments first
            .offset(offset)
            .limit(limit)
        )
        payments = result.scalars().all()
        
        # Get total count for pagination
        count_result = await db.execute(
            select(func.count(Payment.id))
            .join(Installment, Payment.installment_id == Installment.id)
            .where(Installment.user_id == current_user.id)
        )
        total_count = count_result.scalar() or 0
        
        # Calculate total pages
        total_pages = (total_count + limit - 1) // limit  # Ceiling division
        
        # Return paginated response
        return {
            "items": payments,
            "pagination": {
                "total": total_count,
                "page": page,
                "limit": limit,
                "pages": total_pages
            }
        }
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Rollback the session in case of an error
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to retrieve payments: {str(e)}") from e

@payment_router.post("/", response_model=PaymentResponse)
async def create_payment(
    payment: PaymentCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    installment_id = payment.installment_id
    if not installment_id:
        raise HTTPException(status_code=400, detail="Installment ID is required")
    if payment.amount_in_bdt <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be greater than 0")
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
        if payment.amount_in_bdt > actual_remaining:
            raise HTTPException(status_code=400, detail="Payment exceeds remaining amount")
        
        # For the final payment, allow an amount that's less than the installment amount
        # but equal to the actual remaining amount
        is_final_payment = abs(actual_remaining - payment.amount_in_bdt) < 0.01
        
        if not is_final_payment and payment.amount_in_bdt < installment.installment_amount_in_bdt:
            raise HTTPException(status_code=400, detail="Payment is less than the installment amount")

        # Create new payment
        new_payment = Payment(
            installment_id=installment_id,
            amount_in_bdt=payment.amount_in_bdt,
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
        
        return new_payment
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Rollback the session in case of an error
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to process payment: {str(e)}") from e
