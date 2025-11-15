"""Clear all traces and annotations from MongoDB"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def clear_database():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.eval_platform

    # Delete all traces
    result1 = await db.traces.delete_many({})
    print(f"Deleted {result1.deleted_count} traces")

    # Delete all annotations
    result2 = await db.annotations.delete_many({})
    print(f"Deleted {result2.deleted_count} annotations")

    client.close()

if __name__ == "__main__":
    asyncio.run(clear_database())
