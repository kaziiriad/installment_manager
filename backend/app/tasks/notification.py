from celery import Celery
from datetime import datetime, timedelta
import asyncio
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from core.database import AsyncSessionLocal
from models.db_models import User, Role, Installment, Product
from services.email import send_due_email
from core.config import settings

# Initialize Celery properly with the queue-specific Redis URL
celery = Celery(
    "tasks",
    broker=settings.REDIS_URL_QUEUE,
    backend=settings.REDIS_URL_QUEUE
)

# Configure Celery
celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery.task(name="send_due_notification")
def send_due_notification(installment_id):
    """
    Task to send a notification email for a specific installment
    """
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(_send_specific_due_notification(installment_id))

async def _send_specific_due_notification(installment_id):
    """
    Async function to send notification for a specific installment
    """
    async with AsyncSessionLocal() as session:
        # Get the installment with related user and product using explicit joins
        query = select(Installment).where(
            Installment.id == installment_id
        ).options(
            selectinload(Installment.user),
            selectinload(Installment.product)
        )
        
        result = await session.execute(query)
        installment = result.scalars().first()
        
        if installment and installment.user and hasattr(installment.user, 'email') and installment.user.is_verified and installment.product:
            # Send email notification
            response = send_due_email(
                to_email=installment.user.email,
                product_name=installment.product.name,
                due_date=installment.due_date
            )
            return f"Notification sent for installment {installment_id} to {installment.user.email}"
        return f"Failed to send notification for installment {installment_id}"

@celery.task(name="send_all_due_notifications")
def send_all_due_notifications(days_ahead=3):
    """
    Task to send notification emails for all installments due in the specified days ahead
    """
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(_send_all_due_notifications_async(days_ahead))

async def _send_all_due_notifications_async(days_ahead):
    """
    Async function to fetch upcoming due installments and send notifications
    """
    today = datetime.now().date()
    notification_window = today + timedelta(days=days_ahead)
    
    async with AsyncSessionLocal() as session:
        # Query for installments due in the specified window with remaining amount > 0
        # Explicitly load the user and product relationships
        query = select(Installment).options(
            selectinload(Installment.user),
            selectinload(Installment.product)
        ).where(
            Installment.due_date <= notification_window,
            Installment.due_date >= today,
            Installment.remaining_amount > 0
        )
        
        result = await session.execute(query)
        upcoming_installments = result.scalars().all()
        
        notification_count = 0
        for installment in upcoming_installments:
            # Check if user and product are properly loaded
            if installment.user and hasattr(installment.user, 'email') and installment.user.is_verified and installment.product:
                # Send email notification
                send_due_email(
                    to_email=installment.user.email,
                    product_name=installment.product.name,
                    due_date=installment.due_date
                )
                notification_count += 1
        
        return f"Sent {notification_count} due date notifications"

# Task to check for installments due tomorrow
@celery.task(name="check_tomorrow_due_installments")
def check_tomorrow_due_installments():
    """
    Task to check and send notifications for installments due tomorrow
    """
    return send_all_due_notifications.delay(days_ahead=1)

# Task to check for installments due in 3 days
@celery.task(name="check_upcoming_due_installments")
def check_upcoming_due_installments():
    """
    Task to check and send notifications for installments due in the next 3 days
    """
    return send_all_due_notifications.delay(days_ahead=3)
