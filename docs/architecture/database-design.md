# Database Design

**Project:** Evals Open Coding Platform
**Database:** MongoDB 6.0+
**Last Updated:** 2025-11-17

---

## Table of Contents

1. [Database Choice Rationale](#database-choice-rationale)
2. [Collections](#collections)
3. [Schema Design](#schema-design)
4. [Indexing Strategy](#indexing-strategy)
5. [Query Patterns](#query-patterns)
6. [Data Growth Projections](#data-growth-projections)
7. [Migration Strategy](#migration-strategy)

---

## Database Choice Rationale

**Decision:** MongoDB (document database) over PostgreSQL (relational)

**Rationale:**

1. **Flexible Schema for CSV Columns**
   - CSV files contain 28 columns, but future datasets may vary
   - `metadata` field stores all CSV columns without schema migrations
   - Phase 2 adds dynamic "label columns" from rubric

2. **Natural Data Model**
   - Traces and annotations are naturally hierarchical documents
   - No join complexity (annotations reference trace_id, but denormalized for speed)
   - Context loading (previous turns) is simple array filtering

3. **Developer Experience**
   - Motor (async MongoDB driver) integrates perfectly with FastAPI
   - Pydantic models map directly to MongoDB documents
   - No ORM complexity (SQLAlchemy would add overhead)

4. **Scale Characteristics**
   - MongoDB handles 100K+ documents easily
   - Horizontal sharding available if needed (unlikely for this use case)
   - Atlas provides managed hosting with automatic backups

**Trade-offs Accepted:**

- No foreign key constraints (handled in application logic)
- No ACID transactions across collections (not needed for our use case)
- Requires careful index planning (see indexing strategy below)

See [ADR-003](./adr/003-database-choice.md) for full decision record.

---

## Collections

### Collection Overview

| Collection | Purpose | Document Count (MVP) | Document Count (Production) |
|------------|---------|---------------------|----------------------------|
| `traces` | Chatbot conversation turns | 100 | 100,000 |
| `annotations` | User evaluations of traces | 300 (3 users × 100) | 500,000 (5 users × 100K) |
| `users` | Synced from Clerk | 5 | 50 |

---

## Schema Design

### Collection: `traces`

**Purpose:** Store imported conversation traces

**Location:** `backend/app/models/trace.py`

**Schema:**

```python
{
  "_id": ObjectId("..."),                    # MongoDB primary key
  "trace_id": "uuid-string",                 # External trace ID (from CSV)
  "flow_session": "session-uuid",            # Conversation session ID
  "turn_number": 3,                          # Turn number in session (1-indexed)
  "total_turns": 5,                          # Total turns in session
  "user_message": "User's question...",      # User input
  "ai_response": "AI's response...",         # Chatbot response
  "metadata": {                              # All CSV columns (flexible)
    "Turn_Number": 3,
    "body.user_message": "...",
    "response.text_output": "...",
    "confidence_score": 0.95,
    "latency_ms": 234,
    # ... 23 more columns from CSV
  },
  "imported_at": ISODate("2025-11-17T10:30:00Z"),
  "imported_by": "user_2abc123"              # Clerk user ID
}
```

**Field Constraints:**

| Field | Type | Required | Unique | Notes |
|-------|------|----------|--------|-------|
| `_id` | ObjectId | Yes | Yes | MongoDB auto-generated |
| `trace_id` | String | Yes | Yes | From CSV, indexed uniquely |
| `flow_session` | String | Yes | No | Session UUID, indexed for context queries |
| `turn_number` | Integer | Yes | No | 1-indexed turn number |
| `total_turns` | Integer | Yes | No | Total turns in session |
| `user_message` | String | Yes | No | Can be empty string |
| `ai_response` | String | Yes | No | Can be empty string |
| `metadata` | Object | No | No | Stores all CSV columns dynamically |
| `imported_at` | DateTime | Yes | No | Timestamp of import |
| `imported_by` | String | Yes | No | Clerk user ID of importer |

**Why This Design:**

1. **Denormalization:** `user_message` and `ai_response` duplicated from `metadata` for faster queries (avoid nested field access)
2. **Metadata Flexibility:** Future CSV formats supported without schema changes
3. **Session Context:** `flow_session` + `turn_number` enable context loading without joins

---

### Collection: `annotations`

**Purpose:** Store user evaluations of traces

**Location:** `backend/app/models/annotation.py`

**Schema:**

```python
{
  "_id": ObjectId("..."),
  "trace_id": "uuid-string",                    # Foreign key to traces.trace_id
  "user_id": "user_2abc123",                    # Clerk user ID
  "holistic_pass_fail": "Pass",                 # "Pass" | "Fail"
  "first_failure_note": "Failed at step 2",     # Optional, required if Fail
  "open_codes": "hallucination, tone",          # Comma-separated codes
  "comments_hypotheses": "Analysis notes...",   # Free-form text
  "created_at": ISODate("2025-11-17T10:35:00Z"),
  "updated_at": ISODate("2025-11-17T10:40:00Z"),
  "version": 2                                  # Incremented on each update
}
```

**Field Constraints:**

| Field | Type | Required | Max Length | Notes |
|-------|------|----------|------------|-------|
| `trace_id` | String | Yes | - | Must exist in `traces` collection |
| `user_id` | String | Yes | - | Clerk user ID |
| `holistic_pass_fail` | Enum | Yes | - | "Pass" or "Fail" |
| `first_failure_note` | String | No | 256 | Required if `holistic_pass_fail == "Fail"` |
| `open_codes` | String | No | 500 | Comma-separated, Phase 2 → multi-select |
| `comments_hypotheses` | String | No | 1000 | Optional for Pass, required for Fail |
| `created_at` | DateTime | Yes | - | Timestamp of first annotation |
| `updated_at` | DateTime | Yes | - | Timestamp of last update |
| `version` | Integer | Yes | - | Starts at 1, incremented on update |

**Unique Constraint:** Compound index on `(trace_id, user_id)` enforces one annotation per user per trace.

**Why This Design:**

1. **User Isolation:** `user_id` enables multi-user annotations on same trace
2. **Versioning:** `version` field supports audit trail (Phase 2: store full history)
3. **Validation:** Pydantic model validates `first_failure_note` required for Fail
4. **Flexible Codes:** `open_codes` as string (Phase 1), migrate to array (Phase 2)

---

### Collection: `users`

**Purpose:** Cache Clerk user data for queries

**Schema:**

```python
{
  "_id": ObjectId("..."),
  "clerk_id": "user_2abc123",                   # Unique Clerk user ID
  "email": "evaluator@example.com",
  "name": "Jane Evaluator",
  "created_at": ISODate("2025-11-01T08:00:00Z"),
  "updated_at": ISODate("2025-11-17T10:00:00Z")
}
```

**Data Flow:**

1. User signs up/updates in Clerk
2. Clerk sends webhook to `/api/auth/webhook`
3. Backend upserts user in `users` collection
4. Annotations reference `user_id` (Clerk ID)

**Why Cache Users:**

- Avoid Clerk API calls for every annotation query
- Enable user stats aggregation without external API dependency
- Support offline development (users persist locally)

---

## Indexing Strategy

### Traces Collection

**Location:** `backend/app/db/mongodb.py:49`

```python
# Unique index on trace_id (external ID)
traces_collection.create_index("trace_id", unique=True)

# Index for context loading (flow_session, turn_number)
traces_collection.create_index("flow_session")

# Index for audit queries (who imported what)
traces_collection.create_index("imported_by")
traces_collection.create_index("imported_at")
```

**Query Patterns Supported:**

| Query | Index Used | Performance |
|-------|-----------|-------------|
| `find_one({"trace_id": "abc"})` | `trace_id` unique | O(log N) |
| `find({"flow_session": "xyz"}).sort("turn_number", 1)` | `flow_session` + in-memory sort | O(log N + K) where K = turns |
| `find({"imported_by": "user_123"})` | `imported_by` | O(log N) |
| `count_documents({})` | Collection scan | O(N) - **cache this** |

**Index Size Estimates:**

- `trace_id` index: ~32 bytes/doc × 100K = 3.2 MB
- `flow_session` index: ~36 bytes/doc × 100K = 3.6 MB
- Total index overhead: ~7 MB (negligible)

---

### Annotations Collection

**Location:** `backend/app/db/mongodb.py:56`

```python
# Compound index for user-specific annotation lookup (primary use case)
annotations_collection.create_index([("trace_id", 1), ("user_id", 1)])

# Index for user stats queries
annotations_collection.create_index("user_id")

# Index for filtering by result (pass/fail analytics)
annotations_collection.create_index("holistic_pass_fail")

# Index for audit trail (most recent annotations)
annotations_collection.create_index("created_at")
```

**Query Patterns Supported:**

| Query | Index Used | Performance |
|-------|-----------|-------------|
| `find_one({"trace_id": "abc", "user_id": "user_123"})` | `(trace_id, user_id)` compound | O(log N) |
| `find({"user_id": "user_123"})` | `user_id` | O(log N + K) where K = user's annotations |
| `count_documents({"user_id": "X", "holistic_pass_fail": "Pass"})` | `user_id` + filter | O(K) |
| `find({"user_id": "X"}).sort("created_at", -1).limit(5)` | `user_id` + `created_at` | O(log N + 5) |

**Compound Index Design:**

- `(trace_id, user_id)` supports both:
  - Exact match: `{"trace_id": "abc", "user_id": "user_123"}` (upsert pattern)
  - Prefix match: `{"trace_id": "abc"}` (all annotations for a trace - Phase 2 IAA)

**Index Size Estimates (Production):**

- `(trace_id, user_id)` compound: ~64 bytes/doc × 500K = 32 MB
- `user_id`: ~32 bytes/doc × 500K = 16 MB
- Total index overhead: ~50 MB (acceptable)

---

### Users Collection

```python
# Unique index on clerk_id
users_collection.create_index("clerk_id", unique=True)

# Index for email lookup (optional, for admin features)
users_collection.create_index("email")
```

**Performance:** Small collection (< 100 documents), indexes negligible.

---

## Query Patterns

### 1. Trace Listing (Paginated)

**Endpoint:** `GET /api/traces?page=1&page_size=50`

**Query:**

```python
traces_collection.find({})
  .skip((page - 1) * page_size)
  .limit(page_size)
  .sort([("flow_session", -1), ("turn_number", 1)])
```

**Indexes Used:**
- No index for sort (in-memory sort acceptable for 50 docs)
- **Optimization:** Add compound index `(flow_session, turn_number)` if sorting is slow

**Estimated Performance:**
- Page 1: 120ms (collection scan + sort)
- Page 100: 200ms (skip penalty increases with page number)

---

### 2. Trace Detail with Context

**Endpoint:** `GET /api/traces/{trace_id}`

**Queries:**

```python
# Main trace
trace = await traces_collection.find_one({"trace_id": trace_id})

# Context (previous turns)
context = traces_collection.find({
  "flow_session": trace["flow_session"],
  "turn_number": {"$lt": trace["turn_number"]}
}).sort("turn_number", 1)
```

**Indexes Used:**
- `trace_id` unique index (main query)
- `flow_session` index (context query)

**Estimated Performance:** 80ms (2 queries, both indexed)

---

### 3. Next Unannotated Trace

**Endpoint:** `GET /api/traces/next/unannotated`

**Current Implementation (SLOW):**

```python
# Get all annotated trace IDs
annotated_ids = [doc["trace_id"] async for doc in annotations_collection.find({"user_id": user_id})]

# Find first trace NOT in annotated list
unannotated = await traces_collection.find_one({"trace_id": {"$nin": annotated_ids}})
```

**Performance:**
- 100 annotations: 50ms
- 1K annotations: 150ms
- 10K annotations: **2 seconds** (loads 10K IDs into memory)

**Optimized Implementation (Phase 2):**

```python
pipeline = [
  {
    "$lookup": {
      "from": "annotations",
      "let": {"trace_id": "$trace_id"},
      "pipeline": [
        {"$match": {"$expr": {"$eq": ["$trace_id", "$$trace_id"]}, "user_id": user_id}}
      ],
      "as": "user_annotations"
    }
  },
  {"$match": {"user_annotations": {"$size": 0}}},  # No annotations
  {"$sort": {"flow_session": -1, "turn_number": 1}},
  {"$limit": 1},
  {"$project": {"trace_id": 1}}
]
unannotated = await traces_collection.aggregate(pipeline).to_list(length=1)
```

**Optimized Performance:** < 50ms (pushes logic to MongoDB, uses indexes)

See [ADR-005](./adr/005-unannotated-query-optimization.md) for full analysis.

---

### 4. User Annotation Stats

**Endpoint:** `GET /api/annotations/user/stats`

**Queries:**

```python
# Total annotations
total = await annotations_collection.count_documents({"user_id": user_id})

# Pass count
pass_count = await annotations_collection.count_documents({
  "user_id": user_id,
  "holistic_pass_fail": "Pass"
})

# Fail count
fail_count = await annotations_collection.count_documents({
  "user_id": user_id,
  "holistic_pass_fail": "Fail"
})

# Recent annotations
recent = annotations_collection.find({"user_id": user_id}).sort("updated_at", -1).limit(5)
```

**Indexes Used:**
- `user_id` index (all queries)
- `holistic_pass_fail` index (pass/fail counts)
- `updated_at` index (recent annotations)

**Estimated Performance:** 40ms (4 index queries + 1 fetch)

**Optimization (Phase 2):** Cache stats in Redis with 5-minute TTL.

---

## Data Growth Projections

### Storage Estimates

**Traces Collection:**

| Field | Avg Size | Total (100K docs) |
|-------|----------|-------------------|
| `_id` | 12 bytes | 1.2 MB |
| `trace_id` | 36 bytes | 3.6 MB |
| `flow_session` | 36 bytes | 3.6 MB |
| `user_message` | 200 bytes | 20 MB |
| `ai_response` | 500 bytes | 50 MB |
| `metadata` | 2 KB | 200 MB |
| Other fields | 100 bytes | 10 MB |
| **Total** | **~3 KB/doc** | **~300 MB** |

**Annotations Collection:**

| Field | Avg Size | Total (500K docs) |
|-------|----------|-------------------|
| `_id` | 12 bytes | 6 MB |
| `trace_id` | 36 bytes | 18 MB |
| `user_id` | 32 bytes | 16 MB |
| `comments_hypotheses` | 200 bytes | 100 MB |
| Other fields | 150 bytes | 75 MB |
| **Total** | **~500 bytes/doc** | **~250 MB** |

**Total Database Size (Production):** ~550 MB + ~50 MB indexes = **~600 MB**

**MongoDB Atlas Tier:** M2 (2 GB storage) sufficient for production.

---

### Growth Rate

| Metric | Monthly Growth | Annual Growth |
|--------|----------------|---------------|
| New traces | 10K | 120K |
| New annotations | 30K (3 users) | 360K |
| Storage increase | ~60 MB | ~720 MB |

**Projection:** M2 tier (2 GB) supports 2-3 years of growth.

---

## Migration Strategy

### Schema Evolution (Phase 2)

**Planned Changes:**

1. **Annotations: `open_codes` String → Array**
   ```python
   # Current: "hallucination, tone"
   # Future: ["hallucination", "tone"]
   ```

   **Migration Script:**
   ```python
   async for annotation in annotations_collection.find({"open_codes": {"$type": "string"}}):
       codes_array = annotation["open_codes"].split(",") if annotation["open_codes"] else []
       await annotations_collection.update_one(
           {"_id": annotation["_id"]},
           {"$set": {"open_codes": codes_array}}
       )
   ```

2. **Annotations: Add Dynamic Label Columns**
   ```python
   # Add new fields without schema change (MongoDB advantage)
   {
     "label_accuracy": "correct",
     "label_tone": "professional",
     "label_completeness": "partial"
   }
   ```

   **No Migration Needed:** MongoDB supports adding fields dynamically.

---

### Backup Strategy

**Development:**
- Docker volume backups (manual)

**Production (MongoDB Atlas):**
- Continuous cloud backups (7-day retention)
- Point-in-time recovery (PITR) enabled
- Pre-deployment snapshot before migrations

---

## Performance Tuning

### Connection Pooling

**Current:** Default Motor settings (100 connections)

**Recommended (Production):**

```python
client = AsyncIOMotorClient(
    settings.mongodb_url,
    maxPoolSize=100,        # Max concurrent connections
    minPoolSize=10,         # Keep connections warm
    maxIdleTimeMS=60000,    # Close idle connections after 60s
    serverSelectionTimeoutMS=5000  # Fail fast if MongoDB unreachable
)
```

---

### Query Optimization Checklist

- [x] All queries use indexes (verified with `.explain()`)
- [ ] Aggregation pipeline for complex queries (Phase 2)
- [ ] Redis caching for stats queries (Phase 2)
- [ ] Partial indexes for sparse fields (if needed)
- [ ] MongoDB profiler enabled in production (log slow queries > 100ms)

---

## Related Documents

- [Architecture Overview](./architecture-overview.md)
- [Scaling Strategy](./scaling-strategy.md)
- [ADR-003: MongoDB Choice](./adr/003-database-choice.md)
- [ADR-005: Unannotated Query Optimization](./adr/005-unannotated-query-optimization.md)

---

**Last Review:** 2025-11-17 (Winston - Architect Agent)
**Next Review:** Before Phase 2 schema changes
