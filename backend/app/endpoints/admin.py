# admin.py
from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_async_db
from app.models.db_models import User, Installment, Payment
from app.models.schemas import UserResponse, ReportResponse, PaginatedReportResponse
from app.core.security import require_admin
import enum
import calendar
from typing import Optional

# Enum for report types
class ReportType(str, enum.Enum):
    weekly = "weekly"
    monthly = "monthly"
    all = "all"

admin_router = APIRouter(
    prefix="/admin",
    dependencies=[Depends(require_admin)],
    tags=["Admin"]
)

@admin_router.get("/reports", response_model=PaginatedReportResponse)
async def generate_report(
    report_type: ReportType,  # 'weekly', 'monthly', or 'all'
    year: Optional[int] = None,
    week: Optional[int] = None,
    month: Optional[int] = None,
    page: int = 1,
    limit: int = 10,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Generate payment reports (weekly/monthly/all) with pagination
    
    For weekly reports:
    - If week is provided, it uses ISO calendar week for that year
    - If week is not provided, it uses the current week
    
    For monthly reports:
    - If month is provided, it uses that calendar month for the specified year
    - If month is not provided, it uses the current month
    
    For all reports:
    - Returns totals across all data without date filtering
    
    Returns total paid amount, total due amount, and paginated payment details
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
            try:
                first_day = datetime.strptime(f'{year}-W{week:02d}-1', '%Y-W%W-%w').date()
            except ValueError:
                # Handle potential strptime issues with ISO week format
                # Alternative calculation for first day of week
                first_day = datetime.fromisocalendar(year, week, 1).date()
                
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
            
        elif report_type == ReportType.all:
            # For 'all' report type, we don't filter by date
            # Set symbolic start/end dates for the response
            start_date = date(1970, 1, 1)  # Unix epoch start
            end_date = today
            
            # Calculate total paid amount (all time) - using actual DB column
            paid_result = await db.execute(
                select(func.sum(Payment.amount))
            )
            total_paid_cents = paid_result.scalar() or 0
            total_paid = total_paid_cents / 100.0  # Convert cents to BDT
            
            # Calculate total due amount (all time) - using actual DB column
            due_result = await db.execute(
                select(func.sum(Installment.remaining_amount))
            )
            total_due_cents = due_result.scalar() or 0
            total_due = total_due_cents / 100.0  # Convert cents to BDT
            
            # Get paginated payment details
            payment_query = select(
                Payment.id,
                Payment.amount,
                Payment.payment_date,
                Payment.installment_id,
                User.name.label("user_name"),
                User.email.label("user_email")
            ).join(
                Installment, Payment.installment_id == Installment.id
            ).join(
                User, Installment.user_id == User.id
            ).order_by(
                Payment.payment_date.desc()
            ).offset(
                (page - 1) * limit
            ).limit(limit)
            
            payment_result = await db.execute(payment_query)
            payments = payment_result.fetchall()
            
            # Get total count for pagination
            count_query = select(func.count(Payment.id))
            count_result = await db.execute(count_query)
            total_count = count_result.scalar() or 0
            
            # Format payment details
            payment_details = []
            for payment in payments:
                payment_details.append({
                    "id": payment.id,
                    "amount": payment.amount / 100.0,  # Convert cents to BDT
                    "payment_date": payment.payment_date,
                    "installment_id": payment.installment_id,
                    "user_name": payment.user_name,
                    "user_email": payment.user_email
                })
            
            # Debug information
            print("Report type: all (no date filtering)")
            print(f"Total paid amount (all time): {total_paid}")
            print(f"Total due amount (all time): {total_due}")
            print(f"Total payment records: {total_count}")
            print(f"Showing page {page} with {len(payment_details)} records")
            
            return {
                "report_type": report_type,
                "start_date": start_date,
                "end_date": end_date,
                "total_paid": total_paid,  # Convert cents to BDT
                "total_due": total_due,    # Convert cents to BDT
                "year": year,
                "period": None,  # No specific period for 'all' report
                "payments": payment_details,
                "pagination": {
                    "total": total_count,
                    "page": page,
                    "limit": limit,
                    "pages": (total_count + limit - 1) // limit  # Ceiling division
                }
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid report type. Use 'weekly' or 'monthly'")

        # Debug information
        print(f"Date range: {start_date} to {end_date}")
        
        # Convert date objects to datetime for proper comparison with datetime fields
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())
        
        # Calculate total paid amount with proper date comparison - using actual DB column
        paid_result = await db.execute(
            select(func.sum(Payment.amount))
            .where(Payment.payment_date >= start_datetime)
            .where(Payment.payment_date <= end_datetime)
        )
        total_paid_cents = paid_result.scalar() or 0
        total_paid = total_paid_cents / 100.0  # Convert cents to BDT
        
        # Calculate total due amount - using actual DB column
        due_result = await db.execute(
            select(func.sum(Installment.remaining_amount))
            .where(Installment.due_date >= start_date)
            .where(Installment.due_date <= end_date)
        )
        total_due_cents = due_result.scalar() or 0
        total_due = total_due_cents / 100.0  # Convert cents to BDT
        
        # Get paginated payment details for the date range
        payment_query = select(
            Payment.id,
            Payment.amount,
            Payment.payment_date,
            Payment.installment_id,
            User.name.label("user_name"),
            User.email.label("user_email")
        ).join(
            Installment, Payment.installment_id == Installment.id
        ).join(
            User, Installment.user_id == User.id
        ).where(
            Payment.payment_date >= start_datetime
        ).where(
            Payment.payment_date <= end_datetime
        ).order_by(
            Payment.payment_date.desc()
        ).offset(
            (page - 1) * limit
        ).limit(limit)
        
        payment_result = await db.execute(payment_query)
        payments = payment_result.fetchall()
        
        # Get total count for pagination
        count_query = select(func.count(Payment.id)).where(
            Payment.payment_date >= start_datetime
        ).where(
            Payment.payment_date <= end_datetime
        )
        count_result = await db.execute(count_query)
        total_count = count_result.scalar() or 0
        
        # Format payment details
        payment_details = []
        for payment in payments:
            payment_details.append({
                "id": payment.id,
                "amount": payment.amount / 100.0,  # Convert cents to BDT
                "payment_date": payment.payment_date,
                "installment_id": payment.installment_id,
                "user_name": payment.user_name,
                "user_email": payment.user_email
            })
        
        print(f"Total payment records in range: {total_count}")
        print(f"Showing page {page} with {len(payment_details)} records")

        return {
            "report_type": report_type,
            "start_date": start_date,
            "end_date": end_date,
            "total_paid": total_paid,  # Convert cents to BDT
            "total_due": total_due,    # Convert cents to BDT
            "year": year,
            "period": week if report_type == ReportType.weekly else month,
            "payments": payment_details,
            "pagination": {
                "total": total_count,
                "page": page,
                "limit": limit,
                "pages": (total_count + limit - 1) // limit  # Ceiling division
            }
        }

    except Exception as e:
        print(f"Error in generate_report: {str(e)}")
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
