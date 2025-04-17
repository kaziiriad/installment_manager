import time
from typing import Dict, Optional, Tuple, Callable, List
from fastapi import Request, Response
import redis.asyncio as redis
from app.core.config import settings
import hashlib
import json
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import logging
import math

logger = logging.getLogger(__name__)

class SlidingWindowRateLimiter(BaseHTTPMiddleware):
    """
    Sliding window rate limiter middleware.
    Uses Redis to track request counts within a sliding time window.
    """
    
    def __init__(
        self, 
        app: ASGIApp, 
        redis_url: str = settings.REDIS_URL_CACHE,
        default_rate: int = 60,  # requests per minute
        default_window: int = 60,  # window size in seconds
        endpoint_limits: Dict[str, Tuple[int, int]] = None,  # {endpoint: (rate, window_size)}
        whitelist_ips: List[str] = None,
        whitelist_paths: List[str] = None,
        key_func: Callable = None
    ):
        super().__init__(app)
        self.redis_url = redis_url
        self.redis_pool = None
        self.default_rate = default_rate
        self.default_window = default_window
        self.endpoint_limits = endpoint_limits or {}
        self.whitelist_ips = whitelist_ips or []
        self.whitelist_paths = whitelist_paths or ["/docs", "/redoc", "/openapi.json"]
        self.key_func = key_func or self._default_key_func
    
    async def get_redis(self) -> redis.Redis:
        """Get or create Redis connection pool"""
        if self.redis_pool is None:
            self.redis_pool = redis.ConnectionPool.from_url(self.redis_url)
        return redis.Redis(connection_pool=self.redis_pool)
    
    def _default_key_func(self, request: Request) -> str:
        """Generate a unique key for the rate limit based on IP and path"""
        ip = request.client.host
        path = request.url.path
        method = request.method
        
        # Create a hash of the IP to avoid storing raw IPs
        ip_hash = hashlib.md5(ip.encode()).hexdigest()
        
        return f"ratelimit:sliding:{ip_hash}:{path}:{method}"
    
    def _get_limits(self, request: Request) -> Tuple[int, int]:
        """Get rate and window size for the current endpoint"""
        path = request.url.path
        method = request.method
        
        # Check for exact path match
        if f"{path}:{method}" in self.endpoint_limits:
            return self.endpoint_limits[f"{path}:{method}"]
        
        # Check for path prefix matches
        for endpoint, limits in self.endpoint_limits.items():
            if ":" in endpoint:
                endpoint_path, endpoint_method = endpoint.split(":")
                if path.startswith(endpoint_path) and method == endpoint_method:
                    return limits
        
        return self.default_rate, self.default_window
    
    async def _check_rate_limit(self, key: str, rate: int, window_size: int) -> Tuple[bool, int, float]:
        """
        Check if the request is within rate limits using sliding window algorithm
        
        Args:
            key: The unique key for this request
            rate: Maximum number of requests allowed in the window
            window_size: Size of the window in seconds
            
        Returns:
            Tuple[bool, int, float]: (allowed, requests_remaining, reset_time)
        """
        r = await self.get_redis()
        now = int(time.time())
        window_start = now - window_size
        
        # Key for the sorted set in Redis
        zset_key = f"{key}:requests"
        
        # Clean up old requests outside the current window
        await r.zremrangebyscore(zset_key, 0, window_start)
        
        # Count current requests in the window
        current_count = await r.zcard(zset_key)
        
        # Check if we're over the limit
        if current_count >= rate:
            # Get the oldest timestamp in our window to calculate reset time
            oldest = await r.zrange(zset_key, 0, 0, withscores=True)
            if oldest:
                reset_time = oldest[0][1] + window_size - now
            else:
                reset_time = 0
                
            return False, 0, reset_time
        
        # Add the current request with timestamp as score
        pipeline = r.pipeline()
        pipeline.zadd(zset_key, {f"{now}:{hash(time.time())}": now})  # Use hash to ensure uniqueness
        pipeline.expire(zset_key, window_size * 2)  # Set expiry to 2x window size for cleanup
        await pipeline.execute()
        
        # Calculate remaining requests and reset time
        remaining = rate - current_count - 1  # -1 for the current request
        
        # For sliding window, reset time is when the oldest request exits the window
        oldest = await r.zrange(zset_key, 0, 0, withscores=True)
        if oldest and current_count > 0:
            reset_time = oldest[0][1] + window_size - now
        else:
            reset_time = 0
            
        return True, remaining, reset_time
    
    async def dispatch(self, request: Request, call_next):
        """Process the request through rate limiting"""
        # Skip rate limiting for whitelisted paths
        if any(request.url.path.startswith(path) for path in self.whitelist_paths):
            return await call_next(request)
        
        # Skip rate limiting for whitelisted IPs
        client_ip = request.client.host
        if client_ip in self.whitelist_ips:
            return await call_next(request)
        
        # Get rate limits for this endpoint
        rate, window_size = self._get_limits(request)
        
        # Generate key for this request
        key = self.key_func(request)
        
        # Check rate limit
        allowed, remaining, reset_time = await self._check_rate_limit(key, rate, window_size)
        
        # If rate limit exceeded, return 429 Too Many Requests
        if not allowed:
            response = Response(
                content=json.dumps({
                    "detail": "Rate limit exceeded",
                    "reset_in_seconds": math.ceil(reset_time)
                }),
                status_code=429,
                media_type="application/json"
            )
            response.headers["Retry-After"] = str(math.ceil(reset_time))
            response.headers["X-RateLimit-Limit"] = str(rate)
            response.headers["X-RateLimit-Remaining"] = "0"
            response.headers["X-RateLimit-Reset"] = str(int(time.time() + reset_time))
            return response
        
        # Process the request
        response = await call_next(request)
        
        # Add rate limit headers to the response
        response.headers["X-RateLimit-Limit"] = str(rate)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(time.time() + reset_time))
        
        return response