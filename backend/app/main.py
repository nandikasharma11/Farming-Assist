import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import init_db
from app.routers import auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown hooks."""
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    # Initialize database tables
    await init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="2.0.0",
    description="Next-Gen Agricultural Operating System & Smart Khata Ledger API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import auth, crops, drone, khata, market_weather

# Static file serving for drone captures
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount(
    "/uploads",
    StaticFiles(directory=os.path.dirname(settings.UPLOAD_DIR)),
    name="uploads"
)

# Mount Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(crops.router, prefix=settings.API_V1_STR)
app.include_router(khata.router, prefix=settings.API_V1_STR)
app.include_router(drone.router, prefix=settings.API_V1_STR)
app.include_router(market_weather.router, prefix=settings.API_V1_STR)

@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
async def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "2.0.0",
        "environment": settings.ENVIRONMENT
    }
