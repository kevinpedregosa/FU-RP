"""Classical CV segmentation for duckweed fronds."""

import cv2
import numpy as np
from scipy import ndimage
from skimage.feature import peak_local_max
from skimage.segmentation import watershed


def classical_pipeline(img: np.ndarray) -> tuple[np.ndarray, int, list[np.ndarray]]:
    """Returns (binary_mask, blob_count, contours_list)."""
    try:
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        mask_a = cv2.inRange(hsv, np.array([25, 40, 60]), np.array([85, 255, 255]))
        mask_b = cv2.inRange(hsv, np.array([85, 30, 60]), np.array([95, 255, 255]))
        mask = cv2.bitwise_or(mask_a, mask_b)

        kernel_open = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        kernel_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel_open)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel_close)

        dist = cv2.distanceTransform(mask, cv2.DIST_L2, 5)
        dist_norm = cv2.normalize(dist, None, 0, 1.0, cv2.NORM_MINMAX)
        _sure_fg = (dist_norm > 0.4).astype(np.uint8)
        coords = peak_local_max(dist_norm, min_distance=12, labels=mask.astype(bool))
        marker_mask = np.zeros(dist_norm.shape, dtype=bool)
        if coords.size > 0:
            marker_mask[tuple(coords.T)] = True
        markers, _ = ndimage.label(marker_mask)
        _img_for_watershed = cv2.cvtColor(img, cv2.COLOR_BGR2RGB) if len(img.shape) == 3 else img
        labels = watershed(-dist_norm, markers, mask=mask.astype(bool))

        contours: list[np.ndarray] = []
        for label_val in np.unique(labels):
            if label_val <= 0:
                continue
            region_mask = (labels == label_val).astype(np.uint8) * 255
            cnts, _ = cv2.findContours(
                region_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )
            for cnt in cnts:
                area = cv2.contourArea(cnt)
                if 80 <= area <= 40000:
                    contours.append(cnt)

        return mask, len(contours), contours
    except Exception as exc:
        print(f"Warning: classical segmentation failed: {exc}")
        shape = img.shape[:2] if img is not None and img.ndim >= 2 else (1, 1)
        return np.zeros(shape, dtype=np.uint8), 0, []
