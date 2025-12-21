"""
Annotations API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
from datetime import datetime
import logging

from app.db.mongodb import get_database
from app.models.annotation import AnnotationModel
from app.api.auth import get_current_user
from app.schemas.annotation import AnnotationCreate, AnnotationUpdate

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("")
async def create_or_update_annotation(
    annotation: AnnotationCreate,
    current_user: Optional[Dict] = Depends(lambda: {"user_id": "demo-user"})  # Temporary: skip auth for testing
):
    """
    Create or update an annotation for a trace
    """
    try:
        db = get_database()
        annotations_collection = db.annotations

        # Check if trace exists
        trace = await db.traces.find_one({"trace_id": annotation.trace_id})
        if not trace:
            raise HTTPException(status_code=404, detail="Trace not found")

        # Check for existing annotation
        existing = await annotations_collection.find_one({
            "trace_id": annotation.trace_id,
            "user_id": current_user["user_id"]
        })

        annotation_data = annotation.dict()
        annotation_data["user_id"] = current_user["user_id"]
        annotation_data["updated_at"] = datetime.utcnow()

        if existing:
            # Update existing annotation
            annotation_data["version"] = existing.get("version", 1) + 1
            annotation_data["created_at"] = existing.get("created_at")

            result = await annotations_collection.replace_one(
                {"_id": existing["_id"]},
                annotation_data
            )

            if result.modified_count == 0:
                raise HTTPException(status_code=500, detail="Failed to update annotation")

            message = "Annotation updated successfully"
        else:
            # Create new annotation
            annotation_data["created_at"] = datetime.utcnow()
            annotation_data["version"] = 1

            result = await annotations_collection.insert_one(annotation_data)

            if not result.inserted_id:
                raise HTTPException(status_code=500, detail="Failed to create annotation")

            annotation_data["_id"] = str(result.inserted_id)
            message = "Annotation created successfully"

        return {
            "message": message,
            "annotation": annotation_data
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving annotation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trace/{trace_id}")
async def get_annotation_for_trace(
    trace_id: str,
    current_user: Optional[Dict] = Depends(lambda: {"user_id": "demo-user"})  # Temporary: skip auth for testing
):
    """
    Get annotation for a specific trace by the current user
    """
    try:
        db = get_database()
        annotation = await db.annotations.find_one({
            "trace_id": trace_id,
            "user_id": current_user["user_id"]
        })

        if not annotation:
            return None

        # Convert ObjectId to string
        annotation["_id"] = str(annotation["_id"])

        return annotation

    except Exception as e:
        logger.error(f"Error getting annotation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/stats")
async def get_user_annotation_stats(
    current_user: Optional[Dict] = Depends(lambda: {"user_id": "demo-user"})  # Temporary: skip auth for testing
):
    """
    Get annotation statistics for the current user
    """
    try:
        db = get_database()
        annotations_collection = db.annotations

        # Get total annotations
        total = await annotations_collection.count_documents({
            "user_id": current_user["user_id"]
        })

        # Get pass/fail counts
        pass_count = await annotations_collection.count_documents({
            "user_id": current_user["user_id"],
            "holistic_pass_fail": "Pass"
        })

        fail_count = await annotations_collection.count_documents({
            "user_id": current_user["user_id"],
            "holistic_pass_fail": "Fail"
        })

        # Get recent annotations
        cursor = annotations_collection.find({
            "user_id": current_user["user_id"]
        }).sort("updated_at", -1).limit(5)

        recent = []
        async for ann in cursor:
            ann["_id"] = str(ann["_id"])
            recent.append({
                "trace_id": ann.get("trace_id"),
                "holistic_pass_fail": ann.get("holistic_pass_fail"),
                "updated_at": ann.get("updated_at")
            })

        return {
            "total_annotations": total,
            "pass_count": pass_count,
            "fail_count": fail_count,
            "pass_rate": round(pass_count / total * 100, 2) if total > 0 else 0,
            "recent_annotations": recent
        }

    except Exception as e:
        logger.error(f"Error getting annotation stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))