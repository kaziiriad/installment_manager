from datetime import datetime, timezone, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_async_db
from app.core.security import get_current_user
from app.models.db_models import Installment, Payment, Product, User
from app.models.schemas import InstallmentCreate, InstallmentResponse, PaginatedInstallmentResponse

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
        return new_installment
    except Exception as e:
        # Rollback the session in case of an error
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create installment") from e
    

@installment_router.get("/installments", response_model=PaginatedInstallmentResponse)
async def get_user_installments(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user),
    page: int = 1,  # Default page number
    limit: int = 10,  # Default limit
):
    """
    Get paginated list of installments for the current user
    """
    try:
        # Calculate offset based on page and limit
        offset = (page - 1) * limit
        
        # Get installments for the current user with pagination
        result = await db.execute(
            select(Installment)
            .where(Installment.user_id == current_user.id)
            .order_by(Installment.due_date)
            .offset(offset)
            .limit(limit)
        )
        installments = result.scalars().all()
        
        # Get total count for pagination
        count_result = await db.execute(
            select(func.count(Installment.id))
            .where(Installment.user_id == current_user.id)
        )
        total_count = count_result.scalar() or 0
        
        # Calculate total pages
        total_pages = (total_count + limit - 1) // limit  # Ceiling division
        
        # Return paginated response
        return PaginatedInstallmentResponse(
            items=installments,
            pagination={
                "total": total_count,
                "page": page,
                "limit": limit,
                "pages": total_pages
            }
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Rollback the session in case of an error
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to retrieve installments: {str(e)}") from e


