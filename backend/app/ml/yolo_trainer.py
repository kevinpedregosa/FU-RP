"""Background YOLO training entry point."""

from pathlib import Path

from app.config import settings
from app.utils.logging_config import get_logger


logger = get_logger(__name__)


def start_training(
    version_tag: str,
    architecture: str,
    epochs: int,
    notes: str | None = None,
) -> dict:
    """Placeholder training job hook for future Ultralytics fine-tuning."""
    output_dir = settings.MODELS_DIR / version_tag
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    logger.info(
        "training_job_started",
        version_tag=version_tag,
        architecture=architecture,
        epochs=epochs,
        notes=notes,
    )
    return {
        "version_tag": version_tag,
        "architecture": architecture,
        "epochs": epochs,
        "output_dir": str(output_dir),
    }
