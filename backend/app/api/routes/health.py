"""Health check route for the Duckweed Frond Counter API."""

from fastapi import APIRouter

from app.config import settings
from app.models.schemas import HealthResponse
from app.utils.logging_config import get_logger


router = APIRouter(prefix="/api", tags=["health"])
logger = get_logger(__name__)


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Return API health and model loading status."""
    try:
        try:
            from app.core.model_manager import ModelManager

            model_loaded = ModelManager.get_instance().is_loaded
        except Exception:
            model_loaded = False

        return HealthResponse(
            status="ok",
            model_loaded=model_loaded,
            environment=settings.ENVIRONMENT,
            version="1.0.0",
        )
    except Exception as exc:
        logger.warning("health_check_degraded", error=str(exc))
        return HealthResponse(
            status="degraded",
            model_loaded=False,
            environment=settings.ENVIRONMENT,
            version="1.0.0",
        )
