# Open Coding Evaluation Platform

A web application for systematically evaluating chatbot conversation traces using open coding methodology.

## Features

- CSV import for bulk trace loading (28-column format)
- Trace viewing with multi-turn context
- Binary pass/fail annotation
- Open coding with custom labels
- Comments and hypotheses tracking
- User authentication via Clerk
- Real-time annotation statistics

## Tech Stack

- **Frontend**: Vue 3.5 + TypeScript + Naive UI
- **Backend**: FastAPI + Python 3.11
- **Database**: MongoDB + Redis
- **Authentication**: Clerk

## Setup Instructions

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker Desktop
- Clerk account (for authentication)

### 1. Clone Repository

```bash
git clone <repository-url>
cd Evals_app
```

### 2. Set Up Backend

#### Install Python Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Clerk credentials:
- `CLERK_BACKEND_API_KEY`: Get from Clerk dashboard
- `CLERK_WEBHOOK_SECRET`: Get from Clerk webhook settings

#### Start Database Services

```bash
# From project root
docker-compose up -d
```

This starts MongoDB on port 27017 and Redis on port 6379.

#### Run Backend Server

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

The API will be available at http://localhost:8000

### 3. Set Up Frontend

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add:
- `VITE_CLERK_PUBLISHABLE_KEY`: Get from Clerk dashboard

#### Run Development Server

```bash
npm run dev
```

The application will be available at http://localhost:5173

## Usage

1. **Sign In**: Use Clerk authentication to sign in
2. **Import CSV**: Navigate to Import page and upload a 28-column CSV file
3. **View Traces**: Browse imported traces in the Traces page
4. **Annotate**: Click on a trace to view details and add annotations
5. **Track Progress**: View annotation statistics on the home page

## CSV Format

The CSV must contain exactly 28 columns with these required fields:
- `trace_id`: Unique identifier for the trace
- `flow_session`: Session UUID
- `turn_number`: Turn number in conversation
- `total_turns`: Total turns in conversation
- `user_message`: User's message text
- `ai_response`: AI's response text

Additional columns are stored as metadata.

## API Documentation

Once the backend is running, view the interactive API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm run test:unit    # Unit tests
npm run test:e2e     # E2E tests
```

## Development

### Project Structure

```
Evals_app/
├── backend/
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Core configuration
│   │   ├── db/          # Database connections
│   │   ├── models/      # Data models
│   │   └── schemas/     # Pydantic schemas
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/  # Vue components
│   │   ├── services/    # API services
│   │   ├── views/       # Page views
│   │   └── router/      # Vue router
│   └── package.json
├── docker-compose.yml
└── README.md
```

### Key Components

- **CsvImporter.vue**: Handles CSV file upload and validation
- **TraceList.vue**: Displays paginated list of traces
- **TraceViewer.vue**: Shows trace details with context
- **AnnotationForm.vue**: Form for creating/updating annotations

## Troubleshooting

### MongoDB Connection Issues
- Ensure Docker Desktop is running
- Check if MongoDB container is running: `docker ps`
- Verify MongoDB is accessible: `docker logs eval_mongodb`

### Clerk Authentication Issues
- Verify Clerk keys in both frontend and backend `.env` files
- Check Clerk dashboard for correct application settings
- Ensure webhook endpoint is configured in Clerk

### CORS Issues
- Backend CORS settings are in `app/main.py`
- Ensure frontend URL is in the allowed origins list

## License
