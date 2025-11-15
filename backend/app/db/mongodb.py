"""
MongoDB connection management
"""
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    database = None

db = MongoDB()

async def connect_to_mongo():
    """Create database connection"""
    try:
        logger.info(f"Connecting to MongoDB at {settings.mongodb_url}")
        db.client = AsyncIOMotorClient(settings.mongodb_url)
        db.database = db.client[settings.mongodb_db_name]

        # Verify connection
        await db.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")

        # Create indexes
        await create_indexes()

    except Exception as e:
        logger.error(f"Could not connect to MongoDB: {e}")
        raise e

async def close_mongo_connection():
    """Close database connection"""
    try:
        if db.client:
            db.client.close()
            logger.info("Disconnected from MongoDB")
    except Exception as e:
        logger.error(f"Error closing MongoDB connection: {e}")

async def create_indexes():
    """Create database indexes"""
    try:
        # Traces collection indexes
        traces_collection = db.database["traces"]
        await traces_collection.create_index("trace_id", unique=True)
        await traces_collection.create_index("flow_session")
        await traces_collection.create_index("imported_by")
        await traces_collection.create_index("imported_at")

        # Annotations collection indexes
        annotations_collection = db.database["annotations"]
        await annotations_collection.create_index([("trace_id", 1), ("user_id", 1)])
        await annotations_collection.create_index("user_id")
        await annotations_collection.create_index("created_at")
        await annotations_collection.create_index("holistic_pass_fail")

        logger.info("Database indexes created successfully")

    except Exception as e:
        logger.error(f"Error creating indexes: {e}")

def get_database():
    """Get database instance"""
    return db.database