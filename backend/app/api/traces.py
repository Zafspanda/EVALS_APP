"""
Traces API endpoints
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Query, Depends
from typing import List, Optional, Dict, Any
import pandas as pd
import io
import logging
import math
from datetime import datetime

from app.core.config import settings
from app.db.mongodb import get_database
from app.models.trace import TraceModel
from app.api.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

def clean_nan_values(data: Dict[str, Any]) -> Dict[str, Any]:
    """Replace NaN values with None for JSON compatibility"""
    return {
        k: (None if isinstance(v, float) and math.isnan(v) else
            clean_nan_values(v) if isinstance(v, dict) else v)
        for k, v in data.items()
    }

# Required CSV columns
REQUIRED_COLUMNS = [
    "trace_id", "flow_session", "turn_number", "total_turns",
    "user_message", "ai_response"
]

@router.post("/import-csv")
async def import_csv(
    file: UploadFile = File(...),
    current_user: Optional[Dict] = Depends(lambda: {"user_id": "demo-user"})  # Temporary: skip auth for testing
):
    """
    Import traces from CSV file
    """
    try:
        # Check file extension
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")

        # Check file size
        contents = await file.read()
        if len(contents) > settings.max_upload_size:
            raise HTTPException(status_code=400, detail=f"File too large. Max size: {settings.max_upload_size} bytes")

        # Parse CSV
        try:
            df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")

        # Log available columns for debugging
        logger.info(f"CSV columns: {list(df.columns)}")

        # Column mapping for flexibility
        column_mappings = {
            'Turn_Number': 'turn_number',
            'Total_Turns_in_Session': 'total_turns',
            'Flow Session': 'flow_session',
            'body.user_message': 'user_message',
            'response.text_output': 'ai_response',
            'id': 'trace_id'
        }

        # Apply column mappings
        df = df.rename(columns=column_mappings)
        logger.info(f"After mapping, columns: {list(df.columns)}")

        # Validate required columns
        missing_columns = [col for col in REQUIRED_COLUMNS if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns after mapping: {', '.join(missing_columns)}. Available: {list(df.columns)}"
            )

        # Relaxed: Accept any number of columns (not just 28)
        logger.info(f"CSV has {len(df.columns)} columns, importing {len(df)} rows")

        # Process and store traces
        db = get_database()
        traces_collection = db.traces
        imported_count = 0
        skipped_count = 0

        for _, row in df.iterrows():
            trace_data = row.to_dict()

            # Replace NaN values with None for JSON compatibility
            trace_data = {
                k: (None if isinstance(v, float) and math.isnan(v) else v)
                for k, v in trace_data.items()
            }

            # Create trace document
            trace = {
                "trace_id": str(trace_data.get("trace_id")),
                "flow_session": str(trace_data.get("flow_session")),
                "turn_number": int(trace_data.get("turn_number", 0)),
                "total_turns": int(trace_data.get("total_turns", 0)),
                "user_message": str(trace_data.get("user_message", "")),
                "ai_response": str(trace_data.get("ai_response", "")),
                "metadata": trace_data,  # Store all columns as metadata
                "imported_at": datetime.utcnow(),
                "imported_by": current_user.get("clerk_id")
            }

            # Check if trace already exists
            existing = await traces_collection.find_one({"trace_id": trace["trace_id"]})
            if existing:
                skipped_count += 1
                logger.info(f"Skipping duplicate trace: {trace['trace_id']}")
                continue

            # Insert trace
            await traces_collection.insert_one(trace)
            imported_count += 1

        return {
            "message": f"Successfully imported {imported_count} traces",
            "imported": imported_count,
            "skipped": skipped_count,
            "total": len(df)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error importing CSV: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def list_traces(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=settings.max_page_size),
    current_user: Optional[Dict] = Depends(lambda: {"user_id": "demo-user"})  # Temporary: skip auth for testing
):
    """
    List traces with pagination
    """
    try:
        db = get_database()
        traces_collection = db.traces

        # Calculate pagination
        skip = (page - 1) * page_size

        # Get total count
        total = await traces_collection.count_documents({})

        # Get traces - sort by flow_session desc, then turn_number asc
        # This groups sessions together and shows turns in chronological order
        cursor = traces_collection.find({}).skip(skip).limit(page_size).sort([
            ("flow_session", -1),  # Newest sessions first
            ("turn_number", 1)     # But turns within session in order (1, 2, 3...)
        ])
        traces = []
        async for trace in cursor:
            # Convert ObjectId to string
            trace["_id"] = str(trace["_id"])
            # Clean NaN values for JSON compatibility
            trace = clean_nan_values(trace)
            traces.append(trace)

        return {
            "traces": traces,
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": (total + page_size - 1) // page_size
        }

    except Exception as e:
        logger.error(f"Error listing traces: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{trace_id}")
async def get_trace(
    trace_id: str,
    current_user: Optional[Dict] = Depends(lambda: {"user_id": "demo-user"})  # Temporary: skip auth for testing
):
    """
    Get a single trace by ID
    """
    try:
        db = get_database()
        trace = await db.traces.find_one({"trace_id": trace_id})

        if not trace:
            raise HTTPException(status_code=404, detail="Trace not found")

        # Convert ObjectId to string
        trace["_id"] = str(trace["_id"])

        # Get context (previous turns in conversation)
        context = []
        if trace.get("flow_session"):
            cursor = db.traces.find({
                "flow_session": trace["flow_session"],
                "turn_number": {"$lt": trace.get("turn_number", 0)}
            }).sort("turn_number", 1)

            async for ctx_trace in cursor:
                context.append({
                    "turn_number": ctx_trace.get("turn_number"),
                    "user_message": ctx_trace.get("user_message"),
                    "ai_response": ctx_trace.get("ai_response")
                })

        trace["context"] = context

        # Clean NaN values for JSON compatibility
        trace = clean_nan_values(trace)

        return trace

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting trace: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{trace_id}/adjacent")
async def get_adjacent_traces(
    trace_id: str,
    current_user: Optional[Dict] = Depends(lambda: {"user_id": "demo-user"})
):
    """
    Get IDs of previous and next traces for efficient navigation
    Returns: {"previous": "trace_id" | null, "next": "trace_id" | null}
    """
    try:
        db = get_database()
        traces_collection = db.traces

        # Get current trace to determine sort position
        current_trace = await traces_collection.find_one({"trace_id": trace_id})
        if not current_trace:
            raise HTTPException(status_code=404, detail="Trace not found")

        # Get previous trace (same sort order as list view)
        previous_cursor = traces_collection.find({
            "$or": [
                {"flow_session": {"$gt": current_trace["flow_session"]}},
                {
                    "flow_session": current_trace["flow_session"],
                    "turn_number": {"$lt": current_trace["turn_number"]}
                }
            ]
        }).sort([("flow_session", -1), ("turn_number", 1)]).limit(1)

        previous_trace = await previous_cursor.to_list(length=1)
        previous_id = previous_trace[0]["trace_id"] if previous_trace else None

        # Get next trace
        next_cursor = traces_collection.find({
            "$or": [
                {"flow_session": {"$lt": current_trace["flow_session"]}},
                {
                    "flow_session": current_trace["flow_session"],
                    "turn_number": {"$gt": current_trace["turn_number"]}
                }
            ]
        }).sort([("flow_session", -1), ("turn_number", 1)]).limit(1)

        next_trace = await next_cursor.to_list(length=1)
        next_id = next_trace[0]["trace_id"] if next_trace else None

        return {
            "previous": previous_id,
            "next": next_id
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting adjacent traces: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/next/unannotated")
async def get_next_unannotated_trace(
    current_user: Optional[Dict] = Depends(lambda: {"user_id": "demo-user"})
):
    """
    Get the first trace without an annotation for the current user
    Returns: trace_id or null if all traces are annotated
    """
    try:
        db = get_database()
        traces_collection = db.traces
        annotations_collection = db.annotations

        # Get all annotated trace IDs for this user
        annotated_cursor = annotations_collection.find(
            {"user_id": current_user.get("user_id")},
            {"trace_id": 1}
        )
        annotated_ids = [doc["trace_id"] async for doc in annotated_cursor]

        # Find first trace not in annotated list
        unannotated_trace = await traces_collection.find_one(
            {"trace_id": {"$nin": annotated_ids}},
            sort=[("flow_session", -1), ("turn_number", 1)]
        )

        if unannotated_trace:
            return {"trace_id": unannotated_trace["trace_id"]}
        else:
            return {"trace_id": None}

    except Exception as e:
        logger.error(f"Error finding unannotated trace: {e}")
        raise HTTPException(status_code=500, detail=str(e))