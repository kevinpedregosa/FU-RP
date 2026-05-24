"""YOLOv8 segmentation inference with graceful fallback."""

import asyncio
import concurrent.futures

import cv2
import numpy as np


def _run_yolo_sync(img: np.ndarray) -> tuple[list[np.ndarray], int, float]:
    """Synchronous YOLO inference -- runs in thread pool."""
    try:
        from app.core.model_manager import ModelManager

        model = ModelManager.get_instance().get_model()
        if model is None:
            return [], 0, 0.0

        results = model(img, verbose=False, conf=0.25, iou=0.45)
        if not results or results[0].masks is None:
            return [], 0, 0.0

        result = results[0]
        masks_tensor = result.masks.data.cpu().numpy()
        confidences = result.boxes.conf.cpu().numpy()

        h, w = img.shape[:2]
        filtered_masks: list[np.ndarray] = []
        filtered_confs: list[float] = []

        for i, mask in enumerate(masks_tensor):
            resized = cv2.resize(mask, (w, h), interpolation=cv2.INTER_LINEAR)
            area = float(np.sum(resized > 0.5))
            if 80 <= area <= 50000:
                filtered_masks.append(resized)
                filtered_confs.append(float(confidences[i]))

        avg_conf = float(np.mean(filtered_confs)) if filtered_confs else 0.0
        return filtered_masks, len(filtered_masks), avg_conf

    except Exception:
        return [], 0, 0.0


async def yolo_inference(img: np.ndarray) -> tuple[list[np.ndarray], int, float]:
    """Async wrapper for YOLO inference. Returns (masks, count, avg_confidence)."""
    loop = asyncio.get_event_loop()
    with concurrent.futures.ThreadPoolExecutor() as pool:
        result = await loop.run_in_executor(pool, _run_yolo_sync, img)
    return result


def masks_to_contours(masks: list[np.ndarray]) -> list[np.ndarray]:
    """Extract largest contour from each binary mask."""
    contours: list[np.ndarray] = []
    for mask in masks:
        try:
            binary = (mask > 0.5).astype(np.uint8) * 255
            cnts, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if cnts:
                contours.append(max(cnts, key=cv2.contourArea))
        except Exception:
            continue
    return contours
