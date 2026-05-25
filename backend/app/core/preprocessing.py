"""Image preprocessing pipeline for duckweed microscopy images."""

from pathlib import Path

import cv2
import numpy as np


def preprocess_image(img: np.ndarray) -> np.ndarray:
    """Preprocess a BGR image for duckweed segmentation."""
    try:
        height, width = img.shape[:2]
        if max(height, width) > 1920:
            scale = 1920 / max(height, width)
            img = cv2.resize(
                img,
                (int(width * scale), int(height * scale)),
                interpolation=cv2.INTER_AREA,
            )

        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        lab[:, :, 0] = clahe.apply(lab[:, :, 0])
        img = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
        img = cv2.bilateralFilter(img, d=9, sigmaColor=75, sigmaSpace=75)
        gaussian = cv2.GaussianBlur(img, (0, 0), 2.0)
        img = cv2.addWeighted(img, 1.4, gaussian, -0.4, 0)
        img = np.clip(img, 0, 255).astype(np.uint8)
        return img.astype(np.uint8)
    except Exception as exc:
        raise ValueError(f"Image preprocessing failed: {exc}") from exc


def get_green_channel_stats(img: np.ndarray) -> dict:
    """Return basic HSV stats for debugging."""
    try:
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        return {
            "mean_hue": float(np.mean(hsv[:, :, 0])),
            "std_sat": float(np.std(hsv[:, :, 1])),
            "mean_val": float(np.mean(hsv[:, :, 2])),
        }
    except Exception as exc:
        raise ValueError(f"Green channel stats failed: {exc}") from exc
