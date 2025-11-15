# Evals Open Coding Tool

## About

The **Evals Open Coding Tool** is a modern, web-based platform designed to streamline the human evaluation and annotation of AI model outputs. Built specifically for ML/AI teams who need to conduct systematic quality assessments, this tool transforms the traditionally manual and error-prone process of LLM evaluation into an efficient, collaborative workflow.

### Why This Tool?

Traditional LLM evaluation often relies on spreadsheets or ad-hoc scripts, leading to:
- Inconsistent evaluation criteria across annotators
- Lost context between prompt and response
- Difficulty tracking annotator agreement
- No standardized export format for CI/CD integration

This tool solves these challenges by providing a purpose-built platform that scales from small research projects to enterprise-grade evaluation workflows.

## Key Features

### Core Functionality
- **Streamlined Annotation Workflow**: Intuitive interface for evaluating LLM responses with customizable rubrics
- **Living Rubrics**: Dynamic evaluation criteria that adapt to your specific use cases and failure modes
- **Golden Set Management**: Curate high-quality reference examples for consistent evaluation standards
- **Bulk Import/Export**: CSV and JSONL support for seamless integration with ML pipelines
- **Multi-turn Context**: View complete conversation history for better evaluation context
- **Confidence Scoring**: Track evaluator confidence levels for each annotation

### Collaboration & Analytics
- **Real-time Collaboration**: Multiple evaluators can work simultaneously
- **Annotator Agreement Tracking**: Measure inter-rater reliability and identify disagreements
- **Comprehensive Analytics**: Track annotation progress, identify patterns, and export insights
- **User Authentication**: Secure, enterprise-grade authentication via Clerk

### Integration & Export
- **CI/CD Ready**: Export formats designed for integration with ML pipelines
- **API-First Design**: RESTful API for programmatic access
- **Flexible Schema**: MongoDB backend adapts to evolving evaluation requirements

## Tech Stack

- **Frontend**: Vue 3.5 + TypeScript with Naive UI component library
- **Backend**: FastAPI (Python 3.13) with async MongoDB driver (Motor)
- **Database**: MongoDB for flexible schema + Redis for caching
- **Authentication**: Clerk for secure, scalable user management
- **Testing**: Playwright (E2E) + Pytest (API) with 65%+ test coverage
- **Development**: Hot-reload, Docker Compose for local services

## Setup Instructions

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker Desktop
- Clerk account (for authentication)

### 1. Clone Repository

```bash
git clone https://github.com/Zaf-Sendle/Evals_Open_Coding_Tool.git
cd Evals_Open_Coding_Tool
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

## Contributing

We welcome contributions! Areas where you can help:
- Adding new export formats
- Improving annotation UI/UX
- Enhancing analytics capabilities
- Writing additional tests
- Improving documentation

Please open an issue first to discuss major changes.

## Support

- **Issues**: [GitHub Issues](https://github.com/Zaf-Sendle/Evals_Open_Coding_Tool/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Zaf-Sendle/Evals_Open_Coding_Tool/discussions)

## License

MIT License - see [LICENSE](./LICENSE) file for details.
