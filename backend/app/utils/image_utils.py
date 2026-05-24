"""Image utilities built on OpenCV and Pillow."""

from pathlib import Path
import base64

import cv2
import numpy as np
from PIL import Image


def load_image(path: Path) -> np.ndarray:
    """Load an image from disk as a BGR numpy array."""
    img = cv2.imread(str(path))
    if img is None:
        raise ValueError(f"Could not load image: {path}")
    return img


def save_image(img: np.ndarray, path: Path, quality: int = 92) -> None:
    """Save an image to disk, creating parent directories as needed."""
    path.parent.mkdir(parents=True, exist_ok=True)
    params: list[int] = []
    if path.suffix.lower() in {".jpg", ".jpeg"}:
        params = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
    ok = cv2.imwrite(str(path), img, params)
    if not ok:
        raise OSError(f"Could not save image: {path}")


def get_image_dimensions(path: Path) -> tuple[int, int]:
    """Return image dimensions as (width, height), or (0, 0) on failure."""
    try:
        img = load_image(path)
        height, width = img.shape[:2]
        return int(width), int(height)
    except Exception:
        return 0, 0


def resize_for_inference(img: np.ndarray, max_side: int = 1920) -> np.ndarray:
    """Resize an image down to max_side while preserving aspect ratio."""
    h, w = img.shape[:2]
    if max(h, w) <= max_side:
        return img
    scale = max_side / max(h, w)
    new_size = (int(w * scale), int(h * scale))
    return cv2.resize(img, new_size, interpolation=cv2.INTER_AREA)


def image_to_base64(img: np.ndarray) -> str:
    """Encode a BGR image as a base64 JPEG string."""
    ok, buffer = cv2.imencode(".jpg", img)
    if not ok:
        raise ValueError("Could not encode image")
    return base64.b64encode(buffer).decode("utf-8")


def numpy_to_pil(img: np.ndarray) -> Image.Image:
    """Convert a BGR numpy image to a PIL RGB image."""
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    return Image.fromarray(rgb)


def pil_to_numpy(img: Image.Image) -> np.ndarray:
    """Convert a PIL RGB image to a BGR numpy image."""
    arr = np.array(img.convert("RGB"))
    return cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
