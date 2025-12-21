#!/usr/bin/env python3
"""
Migration script to import annotations from local export to Railway MongoDB.
Run this on Railway using: railway run python migrate_annotations.py
"""
import json
import os
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

# Annotations exported from local development
ANNOTATIONS = [
  {
    "trace_id": "25b98dc0-c066-11f0-b729-53ccee971760",
    "holistic_pass_fail": "Fail",
    "first_failure_note": "The flow failed ",
    "open_codes": "flow_failure",
    "comments_hypotheses": "Flow completely failed. The IR response was none. There's clearly a bottle flow error ",
    "user_id": "demo-user",
    "version": 3
  },
  {
    "trace_id": "c2b11360-c065-11f0-b2d8-4db8bfe5ddd8",
    "holistic_pass_fail": "Fail",
    "first_failure_note": "Escalation failure ",
    "open_codes": None,
    "comments_hypotheses": None,
    "user_id": "demo-user",
    "version": 1
  },
  {
    "trace_id": "3d5998f0-c064-11f0-b2d8-4db8bfe5ddd8",
    "holistic_pass_fail": "Fail",
    "first_failure_note": "Escalation failure ",
    "open_codes": None,
    "comments_hypotheses": None,
    "user_id": "demo-user",
    "version": 1
  },
  {
    "trace_id": "105872e0-c064-11f0-b2d8-4db8bfe5ddd8",
    "holistic_pass_fail": "Fail",
    "first_failure_note": "escalation failure ",
    "open_codes": None,
    "comments_hypotheses": None,
    "user_id": "demo-user",
    "version": 1
  },
  {
    "trace_id": "26e096b0-c068-11f0-83c3-41c32718b087",
    "holistic_pass_fail": "Fail",
    "first_failure_note": "test failure trace",
    "open_codes": "trace_failure",
    "comments_hypotheses": "This is just a test comment ",
    "user_id": "demo-user",
    "version": 1
  },
  {
    "trace_id": "d3c0dce0-c064-11f0-b2d8-4db8bfe5ddd8",
    "holistic_pass_fail": "Pass",
    "first_failure_note": None,
    "open_codes": None,
    "comments_hypotheses": "Test pass ",
    "user_id": "demo-user",
    "version": 1
  },
  {
    "trace_id": "f40c9d70-c066-11f0-b2d8-4db8bfe5ddd8",
    "holistic_pass_fail": "Pass",
    "first_failure_note": None,
    "open_codes": None,
    "comments_hypotheses": "test",
    "user_id": "demo-user",
    "version": 2
  },
  {
    "trace_id": "1dd63f30-c067-11f0-83c3-41c32718b087",
    "holistic_pass_fail": "Pass",
    "first_failure_note": None,
    "open_codes": None,
    "comments_hypotheses": None,
    "user_id": "demo-user",
    "version": 1
  },
  {
    "trace_id": "2c2c2360-c067-11f0-a7f5-8d1bc8c2dd04",
    "holistic_pass_fail": "Pass",
    "first_failure_note": None,
    "open_codes": None,
    "comments_hypotheses": None,
    "user_id": "demo-user",
    "version": 1
  },
  {
    "trace_id": "32a5b350-c067-11f0-83c3-41c32718b087",
    "holistic_pass_fail": "Pass",
    "first_failure_note": None,
    "open_codes": None,
    "comments_hypotheses": None,
    "user_id": "demo-user",
    "version": 1
  },
  {
    "trace_id": "079d6c80-c066-11f0-8534-f968c97a562e",
    "holistic_pass_fail": "Pass",
    "first_failure_note": None,
    "open_codes": None,
    "comments_hypotheses": None,
    "user_id": "demo-user",
    "version": 1
  },
  {
    "trace_id": "ed99fd40-c064-11f0-8534-f968c97a562e",
    "holistic_pass_fail": "Pass",
    "first_failure_note": None,
    "open_codes": None,
    "comments_hypotheses": None,
    "user_id": "demo-user",
    "version": 1
  },
  {
    "trace_id": "feebbc50-c064-11f0-83c3-41c32718b087",
    "holistic_pass_fail": "Pass",
    "first_failure_note": None,
    "open_codes": None,
    "comments_hypotheses": None,
    "user_id": "demo-user",
    "version": 1
  },
  {
    "trace_id": "6f480570-c06b-11f0-8534-f968c97a562e",
    "holistic_pass_fail": "Pass",
    "first_failure_note": None,
    "open_codes": None,
    "comments_hypotheses": None,
    "user_id": "demo-user",
    "version": 1
  },
  {
    "trace_id": "9d3f1850-c50d-11f0-8f90-5325d365821c",
    "holistic_pass_fail": "Pass",
    "first_failure_note": None,
    "open_codes": None,
    "comments_hypotheses": None,
    "user_id": "demo-user",
    "version": 1
  },
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
    "trace_id": "e2865980-c069-11f0-8534-f968c97a562e",
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
  }
]


async def migrate():
    # Get MongoDB connection from environment
    mongo_url = os.environ.get("MONGODB_URL")
    db_name = os.environ.get("MONGODB_DB_NAME", "eval_platform")

    if not mongo_url:
        print("ERROR: MONGODB_URL environment variable not set")
        return

    print(f"Connecting to MongoDB: {db_name}")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    # Get existing traces to validate
    traces_collection = db["traces"]
    annotations_collection = db["annotations"]

    # Get all trace_ids from the database
    existing_traces = await traces_collection.distinct("trace_id")
    print(f"Found {len(existing_traces)} traces in database")

    # Count existing annotations
    existing_count = await annotations_collection.count_documents({})
    print(f"Existing annotations in database: {existing_count}")

    imported = 0
    skipped_no_trace = 0
    updated = 0

    for annotation in ANNOTATIONS:
        trace_id = annotation["trace_id"]

        # Check if trace exists
        if trace_id not in existing_traces:
            print(f"  SKIP: Trace {trace_id} not found in database")
            skipped_no_trace += 1
            continue

        # Check if annotation already exists
        existing = await annotations_collection.find_one({
            "trace_id": trace_id,
            "user_id": annotation["user_id"]
        })

        if existing:
            # Update existing annotation (overwrite with local data)
            result = await annotations_collection.update_one(
                {"trace_id": trace_id, "user_id": annotation["user_id"]},
                {"$set": annotation}
            )
            print(f"  UPDATE: {trace_id} ({annotation['holistic_pass_fail']})")
            updated += 1
        else:
            # Insert new annotation
            await annotations_collection.insert_one(annotation)
            print(f"  INSERT: {trace_id} ({annotation['holistic_pass_fail']})")
            imported += 1

    print(f"\n=== Migration Complete ===")
    print(f"Imported: {imported}")
    print(f"Updated: {updated}")
    print(f"Skipped (no trace): {skipped_no_trace}")

    # Final count
    final_count = await annotations_collection.count_documents({})
    print(f"Total annotations now: {final_count}")

    client.close()


if __name__ == "__main__":
    asyncio.run(migrate())
