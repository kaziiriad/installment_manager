from redis.asyncio import Redis

# Create Redis client instance

async def get_redis_client(url) -> Redis:
    """
    Get or create Redis client instance.
    Returns a singleton Redis client.
    """
    global redis_client
    if redis_client is None:
        redis_client = Redis.from_url(
            url=url,
            encoding="utf-8",
            decode_responses=True
        )
    return redis_client

async def close_redis_connection():
    """Close Redis connection when application shuts down"""
    global redis_client
    if redis_client is not None:
        await redis_client.close()
        redis_client = None



