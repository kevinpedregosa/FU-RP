"""FastAPI application entry point for the Duckweed Frond Counter API."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.middleware import register_middleware
from app.api.routes.dataset import router as dataset_router
from app.api.routes.health import router as health_router
from app.api.routes.inference import router as inference_router
from app.api.routes.upload import router as upload_router
from app.config import settings
from app.database import init_db
from app.utils.logging_config import get_logger, setup_logging


def ensure_runtime_directories() -> None:
    """Create local runtime directories required before app startup."""
    for subdir in ["uploads", "results", "exports"]:
        (settings.STORAGE_DIR / subdir).mkdir(parents=True, exist_ok=True)
    settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup and shutdown tasks."""
    setup_logging(settings.LOG_LEVEL, settings.ENVIRONMENT)
    logger = get_logger(__name__)
    logger.info("Starting Duckweed Frond Counter API", environment=settings.ENVIRONMENT)
    await init_db()
    ensure_runtime_directories()
    try:
        from app.core.model_manager import ModelManager

        ModelManager.get_instance()
        logger.info("Model loaded", loaded=ModelManager.get_instance().is_loaded)
    except Exception as exc:
        logger.warning("Model preload skipped", error=str(exc))
    yield
    logger.info("Shutting down Duckweed Frond Counter API")


app = FastAPI(
    title="Duckweed Frond Counter API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

register_middleware(app)
app.include_router(health_router)
app.include_router(upload_router)
app.include_router(inference_router)
app.include_router(dataset_router)

ensure_runtime_directories()
app.mount("/static", StaticFiles(directory=str(settings.STORAGE_DIR)), name="static")


@app.get("/")
async def root() -> dict:
    """Return basic API metadata."""
    return {"message": "Duckweed Frond Counter API", "docs": "/docs", "version": "1.0.0"}
