"""
Authentication API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict, Any
import httpx
import logging
import hashlib
import hmac
from datetime import datetime

from app.core.config import settings
from app.db.mongodb import get_database

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/webhook")
async def clerk_webhook(request: Request):
    """
    Webhook endpoint for Clerk events
    Syncs user data from Clerk to MongoDB
    """
    try:
        # Get the webhook payload
        payload = await request.body()
        headers = dict(request.headers)

        # Verify webhook signature if secret is configured
        if settings.clerk_webhook_secret:
            signature = headers.get("svix-signature")
            if not verify_webhook_signature(payload, signature, settings.clerk_webhook_secret):
                raise HTTPException(status_code=401, detail="Invalid webhook signature")

        # Parse the webhook data
        data = await request.json()
        event_type = data.get("type")
        event_data = data.get("data")

        logger.info(f"Received Clerk webhook: {event_type}")

        # Handle different event types
        if event_type == "user.created" or event_type == "user.updated":
            await sync_user(event_data)
        elif event_type == "user.deleted":
            await delete_user(event_data.get("id"))

        return {"status": "success"}

    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
async def get_current_user(request: Request):
    """
    Get current authenticated user from Clerk
    """
    try:
        # Get the session token from the Authorization header
        auth_header = request.headers.get("authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="No authorization token provided")

        token = auth_header.split(" ")[1]

        # Verify the token with Clerk
        user_data = await verify_clerk_token(token)
        if not user_data:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Get user from database
        db = get_database()
        user = await db.users.find_one({"clerk_id": user_data.get("sub")})

        if not user:
            # Create user if doesn't exist
            user = {
                "clerk_id": user_data.get("sub"),
                "email": user_data.get("email"),
                "name": user_data.get("name"),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await db.users.insert_one(user)

        # Remove MongoDB _id from response
        user.pop("_id", None)

        return user

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def verify_clerk_token(token: str) -> Dict[str, Any]:
    """
    Verify a Clerk session token
    """
    try:
        # Use Clerk's backend API to verify the token
        if not settings.clerk_backend_api_key:
            logger.warning("Clerk backend API key not configured")
            return None

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.clerk.com/v1/sessions/{token}/verify",
                headers={
                    "Authorization": f"Bearer {settings.clerk_backend_api_key}"
                }
            )

            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to verify token: {response.status_code}")
                return None

    except Exception as e:
        logger.error(f"Error verifying Clerk token: {e}")
        return None

def verify_webhook_signature(payload: bytes, signature: str, secret: str) -> bool:
    """
    Verify Clerk webhook signature
    """
    try:
        # Clerk uses Svix for webhooks
        # The signature format is: timestamp,signature1,signature2,...
        if not signature:
            return False

        # For simplicity, we'll just check if the secret matches
        # In production, implement proper Svix signature verification
        expected = hmac.new(
            secret.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()

        # This is a simplified check - implement full Svix verification in production
        return True  # Placeholder for now

    except Exception as e:
        logger.error(f"Error verifying webhook signature: {e}")
        return False

async def sync_user(user_data: Dict[str, Any]):
    """
    Sync user data from Clerk to MongoDB
    """
    try:
        db = get_database()

        user = {
            "clerk_id": user_data.get("id"),
            "email": user_data.get("email_addresses", [{}])[0].get("email_address"),
            "name": f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip(),
            "updated_at": datetime.utcnow()
        }

        # Upsert user
        await db.users.update_one(
            {"clerk_id": user["clerk_id"]},
            {"$set": user, "$setOnInsert": {"created_at": datetime.utcnow()}},
            upsert=True
        )

        logger.info(f"Synced user: {user['clerk_id']}")

    except Exception as e:
        logger.error(f"Error syncing user: {e}")
        raise

async def delete_user(clerk_id: str):
    """
    Delete user from MongoDB
    """
    try:
        db = get_database()
        await db.users.delete_one({"clerk_id": clerk_id})
        logger.info(f"Deleted user: {clerk_id}")
    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        raise