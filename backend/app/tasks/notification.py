
import asyncio
import logging
from datetime import datetime, timedelta, timezone
from contextlib import asynccontextmanager

from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from core.database import AsyncSessionLocal
from models.db_models import Installment
from services.email import send_due_email
from core.config import settings
from core.celery_app import app as celery

# Set up logging
logger = logging.getLogger(__name__)

def run_async(coro):
    """Utility function to run async code in a synchronous context"""
    loop = asyncio.new_event_loop()
    try:
        asyncio.set_event_loop(loop)
        return loop.run_until_complete(coro)
    finally:
        loop.close()
        asyncio.set_event_loop(None)

@asynccontextmanager
async def get_session():
    """Context manager to get a fresh session for each task"""
    # Create a new engine and session for each task
    # This ensures clean event loop isolation
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    
    session = async_session()
    try:
        yield session
    finally:
        await session.close()
        await engine.dispose()

@celery.task(name="send_due_notification")
def send_due_notification(installment_id):
    """Task to send notification for a specific installment"""
    logger.info(f"Starting notification task for installment {installment_id}")
    return run_async(_send_notification(installment_id))

def validate_installment(installment, installment_id=None):
    """Validate installment data and return any error message"""
    id_str = f" {installment_id}" if installment_id else f" {installment.id}" if installment else ""
    
    if not installment:
        logger.error(f"Installment{id_str} not found")
        return "Installment not found"
        
    if not installment.user:
        logger.warning(f"User not found for installment{id_str}")
        return "User not found"
        
    if not hasattr(installment.user, 'email'):
        logger.warning(f"User has no email attribute for installment{id_str}")
        return "User has no email address"
        
    if not installment.user.is_verified:
        logger.warning(f"User not verified for installment{id_str}")
        return "User is not verified"
        
    if not installment.product:
        logger.warning(f"Product not found for installment{id_str}")
        return "Product not found"
    
    return None  # No validation errors


async def _send_notification(installment_id):
    """Async function to handle notification logic"""
    async with get_session() as session:
        # Get the installment with related user and product using explicit joins
        query = select(Installment).where(
            Installment.id == installment_id
        ).options(
            selectinload(Installment.user),
            selectinload(Installment.product)
        )
        
        result = await session.execute(query)
        installment = result.scalars().first()
        
        error = validate_installment(installment, installment_id)
        if error:
            return f"Failed to send notification: {error}"
        # All checks passed, send the email
        try:
            logger.info(f"Sending email to {installment.user.email} for installment {installment_id}")
            await send_due_email(
                to_email=installment.user.email,
                product_name=installment.product.name,
                due_date=installment.due_date
            )
            logger.info(f"Email sent successfully to {installment.user.email} for installment {installment_id}")
            return f"Notification sent for installment {installment_id} to {installment.user.email}"
        except Exception as e:
            logger.error(f"Error sending email for installment {installment_id}: {str(e)}")
            return f"Failed to send notification: Error sending email for installment {installment_id}: {str(e)}"

@celery.task(name="send_all_due_notifications")
def send_all_due_notifications(days_ahead=3):
    """Task to process all due notifications"""
    logger.info(f"Starting notifications for installments due in {days_ahead} days")
    return run_async(_send_all_notifications(days_ahead))

async def _send_all_notifications(days_ahead):
    """Async function to handle all notifications logic"""
    today = datetime.now(timezone.utc).date()
    notification_window = today + timedelta(days=days_ahead)
    
    logger.info(f"Finding installments due between {today} and {notification_window}")
    
    notification_count = 0
    
    async with get_session() as session:
        query = select(Installment).options(
            selectinload(Installment.user),
            selectinload(Installment.product)
        ).where(
            Installment.due_date <= notification_window,
            Installment.due_date >= today,
            Installment.remaining_amount > 0
        ).limit(100)  # Batch size
        
        result = await session.execute(query)
        upcoming_installments = result.scalars().all()
        
        logger.info(f"Found {len(upcoming_installments)} installments due in the next {days_ahead} days")
        
        for installment in upcoming_installments:
            
            error = validate_installment(installment)
            if error:
                logger.warning(f"Skipping installment {installment.id}: {error}")
                continue


            try:
                
                logger.info(f"Sending email to {installment.user.email} for installment {installment.id}")
                await send_due_email(
                    to_email=installment.user.email,
                    product_name=installment.product.name,
                    due_date=installment.due_date
                )
                notification_count += 1
                logger.info(f"Email sent successfully to {installment.user.email} for installment {installment.id}")
            except Exception as e:
                logger.error(f"Failed to notify for installment {installment.id}: {str(e)}")
        
        return f"Sent {notification_count} notifications for installments due in the next {days_ahead} days"

@celery.task(name="check_tomorrow_due_installments")
def check_tomorrow_due_installments():
    """
    Task to check and send notifications for installments due tomorrow
    """
    logger.info("Checking installments due tomorrow")
    return send_all_due_notifications.delay(days_ahead=1)

@celery.task(name="check_upcoming_due_installments")
def check_upcoming_due_installments():
    """
    Task to check and send notifications for installments due in the next 3 days
    """
    logger.info("Checking installments due in the next 3 days")
    return send_all_due_notifications.delay(days_ahead=3)