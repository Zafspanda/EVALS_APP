# Open Coding Evaluation API Documentation

## Overview

The Open Coding Evaluation API is a FastAPI-based REST API that powers the evaluation platform for analyzing Sendle chatbot conversation traces. It enables evaluators to import, review, and annotate conversations with detailed qualitative coding.

**Base URL (Development):** `http://localhost:8000`

**Interactive API Explorer:** `http://localhost:8000/docs`

## Technology Stack

- **Framework:** FastAPI (Python 3.11+)
- **Database:** MongoDB (for traces and annotations storage)
- **Cache:** Redis (for performance optimization)
- **Authentication:** Clerk (integration via frontend)
- **CORS:** Configured for local development on ports 5173, 5174, 5176

## Architecture

### Database Collections

**Traces Collection** (`traces`)
- Stores chatbot conversation traces imported from CSV
- Indexed on `trace_id` for fast lookups
- Contains user messages, AI responses, tool calls, and session context

**Annotations Collection** (`annotations`)
- Stores evaluator annotations for each trace
- Compound index on `trace_id` and `user_id`
- Supports versioning for audit trail

### Authentication

Currently using demo mode (`user_id: "demo-user"`) for development. Production will use Clerk JWT tokens validated on each request.

## API Endpoints

### Root & Health

#### `GET /`
Returns API information and version.

**Response:**
```json
{
  "message": "Open Coding Evaluation API",
  "version": "0.1.0"
}
```

#### `GET /health`
Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy"
}
```

---

## Traces API (`/api/traces`)

### Import Traces

#### `POST /api/traces/import-csv`
Import chatbot conversation traces from a CSV file.

**Authentication:** Required (demo mode: automatic)

**Request:**
- Content-Type: `multipart/form-data`
- Body: CSV file upload

**Required CSV Columns:**
- `trace_id` or `id` - Unique identifier for the trace
- `flow_session` or `Flow Session` - Session identifier
- `turn_number` or `Turn_Number` - Turn number in conversation
- `total_turns` or `Total_Turns_in_Session` - Total turns in session
- `user_message` or `body.user_message` - User's message
- `ai_response` or `response.text_output` - AI's response

**Optional Columns:**
- Any additional metadata columns will be preserved

**Response:**
```json
{
  "message": "Successfully imported 150 traces (skipped 0 duplicates)",
  "imported": 150,
  "skipped": 0,
  "total": 150
}
```

**Error Codes:**
- `400` - Invalid CSV format, missing columns, or file too large
- `500` - Database error during import

---

### List Traces

#### `GET /api/traces`
Retrieve paginated list of traces.

**Authentication:** Required

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `page_size` (integer, default: 50, max: 100) - Items per page

**Response:**
```json
{
  "traces": [
    {
      "trace_id": "abc123",
      "flow_session": "session-456",
      "turn_number": 1,
      "total_turns": 3,
      "user_message": "How do I track my package?",
      "ai_response": "You can track your package by...",
      "tool_calls": [],
      "previous_turns": []
    }
  ],
  "total": 150,
  "page": 1,
  "page_size": 50,
  "pages": 3
}
```

---

### Get Trace Details

#### `GET /api/traces/{trace_id}`
Retrieve detailed information for a specific trace including session context.

**Authentication:** Required

**Path Parameters:**
- `trace_id` (string) - Unique trace identifier

**Response:**
```json
{
  "trace_id": "abc123",
  "flow_session": "session-456",
  "turn_number": 2,
  "total_turns": 3,
  "user_message": "What's the status?",
  "ai_response": "Your package is in transit...",
  "tool_calls": [
    {
      "id": "call_1",
      "function_name": "track_package",
      "arguments": {"tracking_number": "ABC123"},
      "result": {"status": "in_transit"}
    }
  ],
  "previous_turns": [
    {
      "turn_number": 1,
      "user_message": "How do I track my package?",
      "ai_response": "You can track your package by..."
    }
  ]
}
```

**Error Codes:**
- `404` - Trace not found

---

### Get Next Unannotated Trace

#### `GET /api/traces/next-unannotated`
Get the next trace that hasn't been annotated by the current user.

**Authentication:** Required

**Response:**
```json
{
  "trace_id": "xyz789",
  "flow_session": "session-789",
  "turn_number": 1,
  "user_message": "Hello",
  "ai_response": "Hi there!",
  "tool_calls": [],
  "previous_turns": []
}
```

**Error Codes:**
- `404` - No unannotated traces available

---

### Get Adjacent Traces

#### `GET /api/traces/{trace_id}/adjacent`
Get the previous and next trace IDs for navigation.

**Authentication:** Required

**Path Parameters:**
- `trace_id` (string) - Current trace identifier

**Response:**
```json
{
  "prev": "abc122",
  "next": "abc124"
}
```

**Notes:**
- `prev` and `next` will be `null` if at the beginning or end of the list

---

## Annotations API (`/api/annotations`)

### Create or Update Annotation

#### `POST /api/annotations`
Create a new annotation or update an existing one for a trace.

**Authentication:** Required

**Request Body:**
```json
{
  "trace_id": "abc123",
  "holistic_pass_fail": "Pass",
  "first_failure_note": "Brand identity mismatch",
  "open_codes": "persona_voice_failure,brand_identity_drift",
  "comments_hypotheses": "The bot used third-person framing instead of first-person..."
}
```

**Field Descriptions:**
- `trace_id` (string, required) - Trace being annotated
- `holistic_pass_fail` (string, required) - "Pass" or "Fail"
- `first_failure_note` (string, optional) - Description of the first point of failure
- `open_codes` (string, optional) - Comma-separated codes for qualitative analysis
- `comments_hypotheses` (string, optional) - Detailed analysis and hypothesis

**Response:**
```json
{
  "message": "Annotation created successfully",
  "annotation": {
    "trace_id": "abc123",
    "user_id": "demo-user",
    "holistic_pass_fail": "Pass",
    "first_failure_note": "Brand identity mismatch",
    "open_codes": "persona_voice_failure,brand_identity_drift",
    "comments_hypotheses": "The bot used third-person framing...",
    "version": 1,
    "created_at": "2025-11-24T12:00:00Z",
    "updated_at": "2025-11-24T12:00:00Z"
  }
}
```

**Error Codes:**
- `404` - Trace not found
- `500` - Database error

---

### Get Annotation for Trace

#### `GET /api/annotations/trace/{trace_id}`
Retrieve the current user's annotation for a specific trace.

**Authentication:** Required

**Path Parameters:**
- `trace_id` (string) - Trace identifier

**Response:**
```json
{
  "trace_id": "abc123",
  "user_id": "demo-user",
  "holistic_pass_fail": "Fail",
  "first_failure_note": "Brand identity mismatch",
  "open_codes": "persona_voice_failure,brand_identity_drift",
  "comments_hypotheses": "Detailed analysis...",
  "version": 2,
  "created_at": "2025-11-24T12:00:00Z",
  "updated_at": "2025-11-24T12:30:00Z"
}
```

**Notes:**
- Returns `null` if no annotation exists for this trace and user

---

### Get User Statistics

#### `GET /api/annotations/user/stats`
Get annotation statistics for the current user.

**Authentication:** Required

**Response:**
```json
{
  "total_annotations": 45,
  "pass_count": 30,
  "fail_count": 15,
  "pass_rate": 66.67,
  "recent_annotations": [
    {
      "trace_id": "abc123",
      "holistic_pass_fail": "Pass",
      "updated_at": "2025-11-24T12:30:00Z"
    }
  ]
}
```

**Field Descriptions:**
- `total_annotations` - Total number of annotations by user
- `pass_count` - Number of traces marked as Pass
- `fail_count` - Number of traces marked as Fail
- `pass_rate` - Percentage of Pass annotations
- `recent_annotations` - Last 10 annotations (most recent first)

---

### Get Recent Annotations

#### `GET /api/annotations/recent`
Get the most recent annotations by the current user.

**Authentication:** Required

**Query Parameters:**
- `limit` (integer, default: 10, max: 50) - Number of annotations to return

**Response:**
```json
{
  "annotations": [
    {
      "trace_id": "abc123",
      "holistic_pass_fail": "Fail",
      "first_failure_note": "Brand identity mismatch",
      "updated_at": "2025-11-24T12:30:00Z"
    }
  ],
  "total": 45
}
```

---

## Data Models

### Trace Model

```python
{
  "trace_id": str,              # Unique identifier
  "flow_session": str,          # Session identifier
  "turn_number": int,           # Turn number in conversation
  "total_turns": int,           # Total turns in session
  "user_message": str,          # User's message
  "ai_response": str,           # AI's response
  "tool_calls": List[dict],     # List of tool calls made
  "previous_turns": List[dict], # Previous conversation turns
  **kwargs                      # Additional metadata fields
}
```

### Annotation Model

```python
{
  "trace_id": str,                        # Reference to trace
  "user_id": str,                         # Evaluator identifier
  "holistic_pass_fail": "Pass" | "Fail", # Overall evaluation
  "first_failure_note": str | None,      # First point of failure
  "open_codes": str | None,              # Comma-separated codes
  "comments_hypotheses": str | None,     # Detailed analysis
  "version": int,                         # Annotation version
  "created_at": datetime,                 # Creation timestamp
  "updated_at": datetime                  # Last update timestamp
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `500` - Internal Server Error

---

## Development Setup

### Prerequisites

- Python 3.11+
- MongoDB running on `localhost:27017`
- Redis running on `localhost:6379`

### Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=eval_platform
REDIS_URL=redis://localhost:6379
MAX_UPLOAD_SIZE=10485760
CLERK_PUBLISHABLE_KEY=your_clerk_key
```

### Running the API

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Running Tests

```bash
pytest tests/
```

---

## Rate Limiting & Performance

- **CSV Import:** Max file size 10MB (configurable)
- **Pagination:** Default 50 items per page, max 100
- **Redis Caching:** Frequently accessed traces are cached
- **MongoDB Indexes:** Optimized for common queries

---

## Future Enhancements

- [ ] Full Clerk authentication integration
- [ ] Real-time collaboration features
- [ ] Export annotations to CSV/JSON
- [ ] Advanced filtering and search
- [ ] Analytics dashboard API
- [ ] WebSocket support for live updates

---

## Support & Contribution

For issues or questions:
- Review the interactive docs at `/docs`
- Check the main project README
- Contact the development team

**API Version:** 0.1.0
**Last Updated:** November 24, 2025
