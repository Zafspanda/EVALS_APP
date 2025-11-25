# Evals Open Coding Tool

## ✅ Project Status

**Current Phase:** Phase 3 - Testing & Validation
**Tech Stack:** React 18 + Sendle Design System + FastAPI + MongoDB

**Sprint Status:**
- ✅ Story 1: Foundation & Core Evaluation - COMPLETE
- 🟡 Story 2: Advanced Features & Export - READY FOR DEVELOPMENT

**Key Documents:**
- [docs/ux-design-specification.md](docs/ux-design-specification.md) - UX blueprint
- [docs/migration-status.yaml](docs/migration-status.yaml) - Progress tracking
- [docs/architecture/adr/006-react-sds-migration.md](docs/architecture/adr/006-react-sds-migration.md) - Architecture decision

---

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
- **Quick Action Annotation Workflow** *(Enhanced Nov 2025)*: One-click "Pass & Next" for 30-50% faster evaluation
  - Skip button for deferred traces
  - Conditional fail form (only shown when needed)
  - Auto-navigation to next unannotated trace
  - Manual Previous/Next for review
- **Living Rubrics**: Dynamic evaluation criteria that adapt to your specific use cases and failure modes
- **Golden Set Management**: Curate high-quality reference examples for consistent evaluation standards
- **Bulk Import/Export**: CSV and JSONL support for seamless integration with ML pipelines
- **Multi-turn Context**: View complete conversation history for better evaluation context

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

- **Frontend**: React 18.3 + TypeScript + Sendle Design System (SDS)
- **Backend**: FastAPI (Python 3.11+) with async MongoDB driver (Motor)
- **Database**: MongoDB for flexible schema + Redis for caching
- **Authentication**: Clerk for secure, scalable user management
- **Testing**: Playwright (E2E) + Pytest (API)
- **Development**: Vite dev server with hot-reload, Docker Compose for local services

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
npm run dev:react
```

The application will be available at http://localhost:5175

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

### Preparing BotDojo Traces for Import

If you're exporting conversation traces from **BotDojo**, we've included a Claude Code skill that enriches and formats the raw export into the CSV format this tool expects.

**What it does:**
- Enriches BotDojo traces with accurate tool success metrics
- Adds turn numbers and session grouping
- Calculates tool performance statistics
- Handles contextual interpretation of tool responses (fixes false negatives)
- Outputs a properly formatted CSV ready for import

**How to use:**

1. Download the skill package: [`claude-tools/botdojo-trace-enrichment.zip`](./claude-tools/botdojo-trace-enrichment.zip)

2. Load it into Claude Code:
   - Open Claude Code (desktop or web)
   - Go to Skills settings
   - Import the `.zip` file

3. Use the skill with your BotDojo export:
   ```
   Use the BotDojo Trace Enrichment skill to process my_export.csv
   ```

4. The enriched CSV will be ready to import into this tool

**Full documentation:** See [`claude-tools/README.md`](./claude-tools/README.md) for detailed information about the enrichment process, custom tool support, and troubleshooting.

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
│   │   ├── components/  # React components
│   │   │   ├── AppHeader/
│   │   │   ├── CsvImporter/
│   │   │   ├── QuickActions/
│   │   │   ├── TraceList/
│   │   │   └── TraceViewer/
│   │   ├── views/       # Page views
│   │   ├── hooks/       # Custom React hooks
│   │   ├── services/    # API services
│   │   └── types/       # TypeScript types
│   └── package.json
├── docker-compose.yml
└── README.md
```

### Key Components

- **CsvImporter**: Handles CSV file upload and validation
- **TraceList**: Displays paginated list of traces with status indicators
- **TraceViewer**: Shows trace details with multi-turn context
- **QuickActions**: One-click Pass/Skip/Fail annotation workflow
- **FailureForm**: Conditional form for failure annotations

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
