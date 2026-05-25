"""Classical computer vision segmentation for duckweed fronds in petri dishes."""

import cv2
import numpy as np
from scipy import ndimage
from skimage.feature import peak_local_max
from skimage.segmentation import watershed


def _find_dish_roi(img: np.ndarray) -> np.ndarray | None:
    """Detect the petri dish circle and return a binary ROI mask of its interior."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (9, 9), 2)
    h, w = img.shape[:2]
    min_radius = int(min(h, w) * 0.25)
    max_radius = int(min(h, w) * 0.55)
    circles = cv2.HoughCircles(
        blurred,
        cv2.HOUGH_GRADIENT,
        dp=1.2,
        minDist=int(min(h, w) * 0.3),
        param1=60,
        param2=35,
        minRadius=min_radius,
        maxRadius=max_radius,
    )
    if circles is None:
        return None

    circles = np.round(circles[0, :]).astype(int)
    cx, cy, radius = max(circles, key=lambda c: c[2])
    mask = np.zeros((h, w), dtype=np.uint8)
    cv2.circle(mask, (cx, cy), int(radius * 0.93), 255, -1)
    return mask


def _is_arc_artifact(cnt: np.ndarray) -> bool:
    """Return True when a contour looks like a thin dish ring arc."""
    area = cv2.contourArea(cnt)
    if area < 10:
        return True

    perimeter = cv2.arcLength(cnt, True)
    if perimeter == 0:
        return False

    compactness = (4 * np.pi * area) / (perimeter**2)
    x, y, w, h = cv2.boundingRect(cnt)
    aspect = max(w, h) / max(1, min(w, h))

    if compactness < 0.12 and aspect > 3.5:
        return True
    if aspect > 7.0:
        return True
    return False


def _is_bubble_artifact(cnt: np.ndarray, img: np.ndarray) -> bool:
    """Return True when a contour is a near-circular water bubble without green signal."""
    area = cv2.contourArea(cnt)
    if area < 15 or area > 800:
        return False

    perimeter = cv2.arcLength(cnt, True)
    if perimeter == 0:
        return False

    circularity = (4 * np.pi * area) / (perimeter**2)
    if circularity < 0.80:
        return False

    mask = np.zeros(img.shape[:2], dtype=np.uint8)
    cv2.drawContours(mask, [cnt], -1, 255, -1)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    mean_sat = float(cv2.mean(hsv[:, :, 1], mask=mask)[0])
    mean_hue = float(cv2.mean(hsv[:, :, 0], mask=mask)[0])
    is_green = (22 <= mean_hue <= 100) and mean_sat > 35
    return not is_green


def classical_pipeline(img: np.ndarray) -> tuple[np.ndarray, int, list[np.ndarray]]:
    """Returns (binary_mask, blob_count, contours_list)."""
    try:
        h, w = img.shape[:2]
        roi_mask = _find_dish_roi(img)

        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        mask_a = cv2.inRange(hsv, np.array([22, 35, 55]), np.array([88, 255, 255]))
        mask_b = cv2.inRange(hsv, np.array([88, 25, 40]), np.array([100, 255, 255]))
        mask = cv2.bitwise_or(mask_a, mask_b)

        b = img[:, :, 0].astype(np.int16)
        g = img[:, :, 1].astype(np.int16)
        r = img[:, :, 2].astype(np.int16)
        excess_green = 2 * g - r - b
        plant_signal = (excess_green > 20).astype(np.uint8) * 255
        mask = cv2.bitwise_and(mask, plant_signal)

        if roi_mask is not None:
            mask = cv2.bitwise_and(mask, roi_mask)

        kernel_open = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        kernel_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel_open)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel_close)

        dist = cv2.distanceTransform(mask, cv2.DIST_L2, 5)
        dist_norm = cv2.normalize(dist, None, 0, 1.0, cv2.NORM_MINMAX)
        coords = peak_local_max(
            dist_norm,
            min_distance=15,
            labels=mask.astype(bool),
            threshold_abs=0.20,
        )
        marker_mask = np.zeros(dist_norm.shape, dtype=bool)
        if coords.size > 0:
            marker_mask[tuple(coords.T)] = True
        markers, _ = ndimage.label(marker_mask)
        labels = watershed(-dist_norm, markers, mask=mask.astype(bool))

        contours: list[np.ndarray] = []
        image_area = h * w
        for label_val in np.unique(labels):
            if label_val <= 0:
                continue
            region_mask = (labels == label_val).astype(np.uint8) * 255
            cnts, _ = cv2.findContours(
                region_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )
            for cnt in cnts:
                area = cv2.contourArea(cnt)
                min_area = max(80, image_area * 0.00003)
                max_area = image_area * 0.015
                if not (min_area <= area <= max_area):
                    continue
                if _is_arc_artifact(cnt):
                    continue
                if _is_bubble_artifact(cnt, img):
                    continue
                contours.append(cnt)

        return mask, len(contours), contours
    except Exception as exc:
        print(f"Warning: segmentation failed: {exc}")
        shape = img.shape[:2] if img is not None and img.ndim >= 2 else (1, 1)
        return np.zeros(shape, dtype=np.uint8), 0, []
