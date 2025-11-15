"""
Redis connection management
"""
import redis.asyncio as redis
from typing import Optional
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

class RedisDB:
    client: Optional[redis.Redis] = None

redis_db = RedisDB()

async def connect_to_redis():
    """Create Redis connection"""
    try:
        logger.info(f"Connecting to Redis at {settings.redis_url}")
        redis_db.client = redis.from_url(
            settings.redis_url,
            db=settings.redis_db,
            encoding="utf-8",
            decode_responses=True
        )

        # Verify connection
        await redis_db.client.ping()
        logger.info("Successfully connected to Redis")

    except Exception as e:
        logger.error(f"Could not connect to Redis: {e}")
        # Redis is optional, don't raise

async def close_redis_connection():
    """Close Redis connection"""
    try:
        if redis_db.client:
            await redis_db.client.close()
            logger.info("Disconnected from Redis")
    except Exception as e:
        logger.error(f"Error closing Redis connection: {e}")

def get_redis():
    """Get Redis instance"""
    return redis_db.client