"""
Main FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.db.mongodb import close_mongo_connection, connect_to_mongo
from app.db.redis import close_redis_connection, connect_to_redis
from app.api import auth, traces, annotations

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle"""
    # Startup
    logger.info("Starting up...")
    await connect_to_mongo()
    await connect_to_redis()

    yield

    # Shutdown
    logger.info("Shutting down...")
    await close_mongo_connection()
    await close_redis_connection()

# Create FastAPI app
app = FastAPI(
    title="Open Coding Evaluation API",
    description="API for evaluating chatbot conversation traces",
    version="0.1.0",
    lifespan=lifespan,
    redirect_slashes=False  # Prevent 307 redirects that break CORS
)

# Configure CORS - origins from settings (BACKEND_CORS_ORIGINS env var)
logger.info(f"Configuring CORS with origins: {settings.cors_origins}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(traces.router, prefix="/api/traces", tags=["Traces"])
app.include_router(annotations.router, prefix="/api/annotations", tags=["Annotations"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Open Coding Evaluation API", "version": "0.1.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}