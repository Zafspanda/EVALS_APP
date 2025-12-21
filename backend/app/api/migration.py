"""
One-time migration endpoint for importing annotations from local dev.
Remove this file after migration is complete.
"""
from fastapi import APIRouter, HTTPException
from app.db.mongodb import get_database
from datetime import datetime

router = APIRouter()

# Annotations exported from local development
LOCAL_ANNOTATIONS = [
    {
        "trace_id": "f8cddb60-c50e-11f0-a733-556eebdefa32",
        "holistic_pass_fail": "Fail",
        "first_failure_note": "Not aware of current date or time in relation to the incident ",
        "open_codes": None,
        "comments_hypotheses": "Bot was not aware of time. Confirmed that a pickup was scheduled for the day before (18th), which didn't happen and then didn't offer assistance. This chat happened on the 19th. ",
        "user_id": "demo-user",
        "version": 5
    },
    {
        "trace_id": "105d0bc0-c50f-11f0-842f-d7956d1170c4",
        "holistic_pass_fail": "Pass",
        "first_failure_note": None,
        "open_codes": None,
        "comments_hypotheses": None,
        "user_id": "demo-user",
        "version": 1
    },
    {
        "trace_id": "1b311c30-c50f-11f0-8b9e-4310d0c9873b",
        "holistic_pass_fail": "Pass",
        "first_failure_note": None,
        "open_codes": None,
        "comments_hypotheses": None,
        "user_id": "demo-user",
        "version": 1
    },
    {
        "trace_id": "e6072500-c50d-11f0-a733-556eebdefa32",
        "holistic_pass_fail": "Pass",
        "first_failure_note": None,
        "open_codes": None,
        "comments_hypotheses": None,
        "user_id": "demo-user",
        "version": 1
    },
    {
        "trace_id": "ece17290-c50d-11f0-8f90-5325d365821c",
        "holistic_pass_fail": "Pass",
        "first_failure_note": None,
        "open_codes": None,
        "comments_hypotheses": None,
        "user_id": "demo-user",
        "version": 1
    },
    {
        "trace_id": "f6368420-c50d-11f0-9c13-27133a182bb6",
        "holistic_pass_fail": "Pass",
        "first_failure_note": None,
        "open_codes": None,
        "comments_hypotheses": None,
        "user_id": "demo-user",
        "version": 1
    },
    {
        "trace_id": "02023b00-c50e-11f0-a733-556eebdefa32",
        "holistic_pass_fail": "Pass",
        "first_failure_note": None,
        "open_codes": None,
        "comments_hypotheses": None,
        "user_id": "demo-user",
        "version": 1
    },
    {
        "trace_id": "df3059e0-c50d-11f0-9c13-27133a182bb6",
        "holistic_pass_fail": "Fail",
        "first_failure_note": "Mentioning that the search results don't mention a specific way ",
        "open_codes": None,
        "comments_hypotheses": "The bot has responded that the search results don't mention a specific way to unlock a Sendle account yourself. It shouldn't be giving a way that it is using a tool or searching for particular information. Either it has the information from the document search in which case it uses that in its output, or if it doesn't it escalates to an agent. Also can't see if the tool use was successful or not.",
        "user_id": "demo-user",
        "version": 1
    },
    {
        "trace_id": "24dbe450-c50e-11f0-8b9e-4310d0c9873b",
        "holistic_pass_fail": "Fail",
        "first_failure_note": "The bot acknowledged the request to cancel as noted.",
        "open_codes": None,
        "comments_hypotheses": "What? That's not the behaviour. The bot hasn't noted anything. Nothing has been passed on to action to actually cancel an account. This is a hallucination ",
        "user_id": "demo-user",
        "version": 1
    },
    {
        "trace_id": "19f906d0-c50e-11f0-8f90-5325d365821c",
        "holistic_pass_fail": "Fail",
        "first_failure_note": "Bot speaks about the brand in third person instead of as the brand",
        "open_codes": "persona_voice_failure, brand_identity_drift",
        "comments_hypotheses": "This likely stems from the prompt structure, or referencing documentation written in third-person (\"Sendle does X, Sendle's policy is Y\"), and it's regurgitating that framing verbatim instead of translating it into first-person voice. The retrieval worked, the comprehension worked, but the persona adaptation failed.",
        "user_id": "demo-user",
        "version": 1
    },
    {
        "trace_id": "df5d5d50-c50d-11f0-8b9e-4310d0c9873b",
        "holistic_pass_fail": "Fail",
        "first_failure_note": "Brand Identity Misalignment / Third-Party Voice Error",
        "open_codes": "persona_voice_failure, brand_identity_drift",
        "comments_hypotheses": "The bot refers to \"Sendle's process\" as if it were an external party explaining another company's policies, rather than speaking as Sendle. This creates psychological distance and undermines trust. The customer is talking to Sendle, not about Sendle. This likely stems from the prompt structure or the bot probably accessed documentation written in the third person (\"Sendle does X, Sendle's policy is Y\"), and it's regurgitating that framing verbatim instead of translating it into a first-person voice. The retrieval worked, the comprehension worked, but the persona adaptation failed.",
        "user_id": "demo-user",
        "version": 2
    },
    {
        "trace_id": "e10831b0-c50e-11f0-a733-556eebdefa32",
        "holistic_pass_fail": "Pass",
        "first_failure_note": None,
        "open_codes": None,
        "comments_hypotheses": None,
        "user_id": "demo-user",
        "version": 1
    },
    {
        "trace_id": "03eefa60-c50f-11f0-9c13-27133a182bb6",
        "holistic_pass_fail": "Pass",
        "first_failure_note": None,
        "open_codes": None,
        "comments_hypotheses": None,
        "user_id": "demo-user",
        "version": 1
    },
    {
        "trace_id": "15702de0-c50f-11f0-8f90-5325d365821c",
        "holistic_pass_fail": "Pass",
        "first_failure_note": None,
        "open_codes": None,
        "comments_hypotheses": None,
        "user_id": "demo-user",
        "version": 1
    },
    {
        "trace_id": "00e72e10-c50e-11f0-8f90-5325d365821c",
        "holistic_pass_fail": "Pass",
        "first_failure_note": None,
        "open_codes": None,
        "comments_hypotheses": None,
        "user_id": "demo-user",
        "version": 1
    },
    {
        "trace_id": "335afb60-c50e-11f0-a733-556eebdefa32",
        "holistic_pass_fail": "Pass",
        "first_failure_note": None,
        "open_codes": None,
        "comments_hypotheses": None,
        "user_id": "demo-user",
        "version": 1
    },
    {
        "trace_id": "1ee20bb0-c50e-11f0-8b9e-4310d0c9873b",
        "holistic_pass_fail": "Pass",
        "first_failure_note": None,
        "open_codes": None,
        "comments_hypotheses": None,
        "user_id": "demo-user",
        "version": 1
    },
    {
        "trace_id": "222ddb50-c50e-11f0-a733-556eebdefa32",
        "holistic_pass_fail": "Pass",
        "first_failure_note": None,
        "open_codes": None,
        "comments_hypotheses": None,
        "user_id": "demo-user",
        "version": 1
    }
]


@router.post("/import-local")
async def import_local_annotations():
    """
    One-time endpoint to import annotations from local development.
    This endpoint will overwrite existing annotations for the same trace_id/user_id.
    """
    db = get_database()
    traces_collection = db["traces"]
    annotations_collection = db["annotations"]

    # Get all trace_ids from the database
    existing_traces = await traces_collection.distinct("trace_id")

    results = {
        "imported": 0,
        "updated": 0,
        "skipped_no_trace": 0,
        "details": []
    }

    for annotation in LOCAL_ANNOTATIONS:
        trace_id = annotation["trace_id"]

        # Check if trace exists
        if trace_id not in existing_traces:
            results["skipped_no_trace"] += 1
            results["details"].append(f"SKIP: Trace {trace_id} not found")
            continue

        # Add timestamps
        now = datetime.utcnow()
        annotation["updated_at"] = now

        # Check if annotation already exists
        existing = await annotations_collection.find_one({
            "trace_id": trace_id,
            "user_id": annotation["user_id"]
        })

        if existing:
            # Update existing annotation
            await annotations_collection.update_one(
                {"trace_id": trace_id, "user_id": annotation["user_id"]},
                {"$set": annotation}
            )
            results["updated"] += 1
            results["details"].append(f"UPDATE: {trace_id} ({annotation['holistic_pass_fail']})")
        else:
            # Insert new annotation
            annotation["created_at"] = now
            await annotations_collection.insert_one(annotation)
            results["imported"] += 1
            results["details"].append(f"INSERT: {trace_id} ({annotation['holistic_pass_fail']})")

    # Get final count
    final_count = await annotations_collection.count_documents({})
    results["total_annotations"] = final_count

    return results
