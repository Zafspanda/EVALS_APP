"""
Authentication API endpoints and utilities
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict, Any, Optional
import logging
from datetime import datetime

import jwt
from jwt import PyJWKClient

from app.core.config import settings
from app.db.mongodb import get_database

logger = logging.getLogger(__name__)
router = APIRouter()

# =============================================================================
# JWKS Client (cached for performance)
# =============================================================================

_jwks_client: Optional[PyJWKClient] = None


def get_jwks_client() -> Optional[PyJWKClient]:
    """Get or create cached JWKS client for Clerk token verification"""
    global _jwks_client
    if _jwks_client is None and settings.clerk_jwks_url:
        _jwks_client = PyJWKClient(settings.clerk_jwks_url)
    return _jwks_client


# =============================================================================
# JWT Token Verification (AUTH-001 Fix)
# =============================================================================

async def verify_clerk_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a Clerk JWT token using JWKS public keys.

    Returns user data dict on success, None on failure.
    """
    try:
        jwks_client = get_jwks_client()
        if not jwks_client:
            logger.error("CLERK_JWKS_URL not configured")
            return None

        # Get signing key from JWKS
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # Decode and verify the token
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False}  # Clerk doesn't always set audience
        )

        return {
            "user_id": claims.get("sub"),
            "email": claims.get("email"),
            "session_id": claims.get("sid")
        }

    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid JWT: {e}")
        return None
    except Exception as e:
        logger.error(f"Error verifying Clerk token: {e}")
        return None


# =============================================================================
# Auth Dependency (AUTH-003 Fix)
# =============================================================================

async def get_current_user(request: Request) -> Dict[str, str]:
    """
    FastAPI dependency that extracts and verifies the current user from JWT.

    Use this in all protected endpoints:
        current_user: Dict = Depends(get_current_user)

    Returns:
        Dict with user_id, email (if available)

    Raises:
        HTTPException 401 if token is missing, invalid, or expired
    """
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid authorization header"
        )

    token = auth_header.split(" ")[1]
    user_data = await verify_clerk_token(token)

    if not user_data:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    return {
        "user_id": user_data["user_id"],
        "email": user_data.get("email")
    }


# =============================================================================
# API Routes
# =============================================================================

@router.get("/me")
async def get_current_user_info(request: Request):
    """
    Get current authenticated user info from Clerk.
    Creates user in MongoDB if doesn't exist.
    """
    try:
        # Get and verify token
        auth_header = request.headers.get("authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="No authorization token provided")

        token = auth_header.split(" ")[1]
        user_data = await verify_clerk_token(token)

        if not user_data:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Get user from database
        db = get_database()
        user = await db.users.find_one({"clerk_id": user_data.get("user_id")})

        if not user:
            # Create user if doesn't exist
            user = {
                "clerk_id": user_data.get("user_id"),
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


@router.post("/webhook")
async def clerk_webhook(request: Request):
    """
    Webhook endpoint for Clerk events.
    Syncs user data from Clerk to MongoDB.
    Uses Svix for signature verification.
    """
    try:
        # Import svix here to avoid startup errors if not installed
        from svix.webhooks import Webhook, WebhookVerificationError

        payload = await request.body()

        # Extract Svix headers
        headers = {
            "svix-id": request.headers.get("svix-id"),
            "svix-timestamp": request.headers.get("svix-timestamp"),
            "svix-signature": request.headers.get("svix-signature"),
        }

        # Check if webhook secret is configured
        if not settings.clerk_webhook_secret:
            logger.error("CLERK_WEBHOOK_SECRET not configured")
            raise HTTPException(status_code=500, detail="Webhook not configured")

        # Verify signature using Svix
        wh = Webhook(settings.clerk_webhook_secret)
        try:
            event = wh.verify(payload, headers)
        except WebhookVerificationError as e:
            logger.error(f"Webhook verification failed: {e}")
            raise HTTPException(status_code=401, detail="Invalid webhook signature")

        # Process verified event
        event_type = event.get("type")
        event_data = event.get("data")

        logger.info(f"Received verified Clerk webhook: {event_type}")

        # Handle different event types
        if event_type in ("user.created", "user.updated"):
            await sync_user(event_data)
        elif event_type == "user.deleted":
            await delete_user(event_data.get("id"))

        return {"status": "success"}

    except HTTPException:
        raise
    except ImportError:
        logger.error("svix package not installed")
        raise HTTPException(status_code=500, detail="Webhook verification unavailable")
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# Helper Functions
# =============================================================================

async def sync_user(user_data: Dict[str, Any]):
    """Sync user data from Clerk to MongoDB"""
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
    """Delete user from MongoDB"""
    try:
        db = get_database()
        await db.users.delete_one({"clerk_id": clerk_id})
        logger.info(f"Deleted user: {clerk_id}")
    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        raise
