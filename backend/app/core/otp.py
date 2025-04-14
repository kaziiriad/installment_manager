import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models.schemas import OTPResponse
from .client import get_redis_client
from .config import settings


def generate_otp(length: int = 6) -> str:
    """Generate a random OTP of given length."""
    digits = "0123456789"
    otp = "".join(random.choice(digits) for _ in range(length))
    return otp

async def save_otp_to_redis(email: str, otp: str, expiry_time: int) -> None:
    """Save the OTP to Redis with an expiry time."""
    try:
        redis_client = await get_redis_client(settings.REDIS_URL_CACHE)
        # Set the OTP with an expiry time in seconds
        await redis_client.set(email, otp, ex=expiry_time * 60)  # expiry_time in minutes
    except Exception as e:
        print(f"Error saving OTP to Redis: {e}")
        raise

async def create_otp(email: str, expiry_time: int = 5) -> OTPResponse:
    """Create an OTP and save it to Redis."""
    otp = generate_otp()
    await save_otp_to_redis(email, otp, expiry_time)
    # Use expiry_duration instead of expiry_time to match the schema
    return OTPResponse(email=email, otp=otp, expiry_duration=expiry_time)


async def verify_otp(email: str, otp: str) -> bool:
    """Verify the OTP against the one stored in Redis."""
    try:
        redis_client = await get_redis_client(settings.REDIS_URL_CACHE)
        stored_otp = await redis_client.get(email)
        if stored_otp is None:
            return False
            
        # If decode_responses=True is set in Redis client, no need to decode
        if isinstance(stored_otp, bytes):
            stored_otp = stored_otp.decode('utf-8')
            
        return stored_otp == otp
    except Exception as e:
        print(f"Error verifying OTP from Redis. OTP Expired: {e}")
        raise

