"""Thread-safe singleton for YOLOv8 model."""

import threading

from app.config import settings
from app.utils.logging_config import get_logger


logger = get_logger(__name__)


class ModelManager:
    _instance: "ModelManager | None" = None
    _lock: threading.Lock = threading.Lock()

    def __init__(self) -> None:
        self.model = None
        self._load_model()

    def _load_yolo(self, model_path: str):
        from ultralytics import YOLO

        try:
            return YOLO(model_path)
        except Exception as exc:
            if "Weights only load failed" not in str(exc):
                raise

            import torch

            original_load = torch.load

            def torch_load_compat(*args, **kwargs):
                kwargs.setdefault("weights_only", False)
                return original_load(*args, **kwargs)

            torch.load = torch_load_compat
            try:
                return YOLO(model_path)
            finally:
                torch.load = original_load

    def _load_model(self) -> None:
        try:
            if settings.YOLO_MODEL_PATH.exists():
                self.model = self._load_yolo(str(settings.YOLO_MODEL_PATH))
                logger.info("Loaded fine-tuned model", path=str(settings.YOLO_MODEL_PATH))
            elif settings.YOLO_FALLBACK_PATH.exists():
                self.model = self._load_yolo(str(settings.YOLO_FALLBACK_PATH))
                logger.info("Loaded fallback model", path=str(settings.YOLO_FALLBACK_PATH))
            else:
                logger.warning("No model weights found -- downloading yolov8n-seg.pt")
                self.model = self._load_yolo("yolov8n-seg.pt")
                logger.info("Downloaded and loaded yolov8n-seg.pt")
        except Exception as exc:
            logger.warning("Model load failed", error=str(exc))
            self.model = None

    @classmethod
    def get_instance(cls) -> "ModelManager":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    @property
    def is_loaded(self) -> bool:
        return self.model is not None

    def get_model(self):
        return self.model
