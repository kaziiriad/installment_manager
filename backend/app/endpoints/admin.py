# admin.py
from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_async_db
from app.models.db_models import User, Installment, Payment
from app.models.schemas import UserResponse, ReportResponse
from app.core.security import require_admin
import enum
import calendar

# Enum for report types
class ReportType(str, enum.Enum):
    weekly = "weekly"
    monthly = "monthly"

admin_router = APIRouter(
    prefix="/admin",
    dependencies=[Depends(require_admin)],
    tags=["Admin"]
)

@admin_router.get("/reports", response_model=ReportResponse)
async def generate_report(
    report_type: ReportType,  # 'weekly' or 'monthly'
    year: int = None,
    week: int = None,
    month: int = None,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Generate payment reports (weekly/monthly)
    
    For weekly reports:
    - If week is provided, it uses ISO calendar week for that year
    - If week is not provided, it uses the current week
    
    For monthly reports:
    - If month is provided, it uses that calendar month for the specified year
    - If month is not provided, it uses the current month
    
    Returns total paid amount and total due amount
    """
    try:
        today = date.today()
        current_year = today.year
        
        # Set default year to current year if not provided
        if year is None:
            year = current_year
            
        # Calculate date range based on report type
        if report_type == ReportType.weekly:
            if week is None:
                # Use current week if not specified
                current_week = today.isocalendar()[1]
                week = current_week
                
            # Validate week number
            if not 1 <= week <= 53:
                raise HTTPException(status_code=400, detail="Week number must be between 1 and 53")
                
            # Get the first day of the specified ISO week
            # ISO week starts on Monday
            first_day = datetime.strptime(f'{year}-W{week:02d}-1', '%Y-W%W-%w').date()
            start_date = first_day
            end_date = first_day + timedelta(days=6)  # Sunday
            
        elif report_type == ReportType.monthly:
            if month is None:
                # Use current month if not specified
                month = today.month
                
            # Validate month number
            if not 1 <= month <= 12:
                raise HTTPException(status_code=400, detail="Month number must be between 1 and 12")
                
            # Get the first and last day of the specified month
            start_date = date(year, month, 1)
            last_day = calendar.monthrange(year, month)[1]
            end_date = date(year, month, last_day)
            
        else:
            raise HTTPException(status_code=400, detail="Invalid report type. Use 'weekly' or 'monthly'")

        # Calculate total paid amount
        paid_result = await db.execute(
            select(func.sum(Payment.amount))
            .where(Payment.payment_date >= start_date)
            .where(Payment.payment_date <= end_date)
        )
        total_paid = paid_result.scalar() or 0

        # Calculate total due amount
        due_result = await db.execute(
            select(func.sum(Installment.remaining_amount))
            .where(Installment.due_date >= start_date)
            .where(Installment.due_date <= end_date)
        )
        total_due = due_result.scalar() or 0

        return {
            "report_type": report_type,
            "start_date": start_date,
            "end_date": end_date,
            "total_paid": total_paid / 100,  # Convert cents to BDT
            "total_due": total_due / 100,    # Convert cents to BDT
            "year": year,
            "period": week if report_type == ReportType.weekly else month
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.get("/customers", response_model=list[UserResponse])
async def list_customers(
    db: AsyncSession = Depends(get_async_db),
    page: int = 1,
    limit: int = 10
):
    """
    Get paginated list of all customers
    """
    try:
        result = await db.execute(
            select(User)
            .where(User.role == "customer")
            .offset((page - 1) * limit)
            .limit(limit)
        )
        customers = result.scalars().all()
        
        return [UserResponse(
            id=customer.id,
            name=customer.name,
            email=customer.email,
            role=customer.role,
            is_verified=customer.is_verified,
        ) for customer in customers]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
