"""Frond counting logic combining classical CV and YOLO results."""

import cv2
import numpy as np


def _distance_peak_count(contour: np.ndarray) -> int:
    """Count strong distance-transform peaks inside one contour."""
    x, y, width, height = cv2.boundingRect(contour)
    if width <= 0 or height <= 0:
        return 0

    padding = 6
    roi_width = width + padding * 2
    roi_height = height + padding * 2
    shifted = contour - np.array([[[x - padding, y - padding]]])
    mask = np.zeros((roi_height, roi_width), dtype=np.uint8)
    cv2.drawContours(mask, [shifted], -1, 255, -1)

    dist = cv2.distanceTransform(mask, cv2.DIST_L2, 5)
    max_distance = float(dist.max())
    if max_distance <= 0:
        return 0

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
    local_max = dist == cv2.dilate(dist, kernel)
    peak_threshold = max(2.0, max_distance * 0.45)
    peak_mask = (local_max & (dist >= peak_threshold)).astype(np.uint8)
    component_count, _labels = cv2.connectedComponents(peak_mask)
    return min(max(component_count - 1, 0), 3)


def _reference_single_frond_area(contours: list[np.ndarray]) -> float | None:
    """Estimate a typical single-frond area from the smaller detected contours."""
    areas = sorted(cv2.contourArea(contour) for contour in contours)
    plausible = [area for area in areas if 50 <= area <= 5000]
    if len(plausible) < 3:
        return None
    lower_half = plausible[: max(3, len(plausible) // 2)]
    return float(np.median(lower_half))


def estimate_lobes_in_contour(
    contour: np.ndarray,
    reference_area: float | None = None,
) -> int:
    """Estimate whether a contour is one frond or a connected pair."""
    area = cv2.contourArea(contour)
    if area < 120:
        return 1

    perimeter = cv2.arcLength(contour, True)
    if perimeter == 0:
        return 1

    x, y, width, height = cv2.boundingRect(contour)
    aspect_ratio = max(width, height) / max(1, min(width, height))

    hull_points = cv2.convexHull(contour)
    hull_area = cv2.contourArea(hull_points) if hull_points is not None else 0
    solidity = area / hull_area if hull_area > 0 else 1.0
    peak_count = _distance_peak_count(contour)

    hull = cv2.convexHull(contour, returnPoints=False)
    defect_count = 0
    if hull is not None and len(hull) > 3 and len(contour) > 3:
        try:
            defects = cv2.convexityDefects(contour, hull)
            if defects is not None:
                for i in range(defects.shape[0]):
                    _, _, _, depth = defects[i, 0]
                    if depth > 8 * 256:
                        defect_count += 1
        except Exception:
            pass

    area_ratio = area / reference_area if reference_area and reference_area > 0 else 1.0
    evidence = 0
    if peak_count >= 2:
        evidence += 2
    if area_ratio >= 1.65:
        evidence += 1
    if area_ratio >= 2.4:
        evidence += 1
    if aspect_ratio >= 1.9:
        evidence += 1
    if solidity < 0.88 or defect_count >= 1:
        evidence += 1

    return 2 if evidence >= 2 else 1


def estimate_classical_fronds(contours: list[np.ndarray]) -> int:
    """Count fronds from classical contours, splitting only likely connected pairs."""
    if not contours:
        return 0
    reference_area = _reference_single_frond_area(contours)
    return sum(estimate_lobes_in_contour(contour, reference_area) for contour in contours)


def count_fronds(
    contours: list,
    yolo_masks: list,
    yolo_count: int,
    classical_count: int,
) -> tuple[int, float]:
    """Merge classical and YOLO signals into final count and confidence."""
    if len(contours) == 0 and yolo_count == 0:
        return 0, 0.0

    contour_count = len(contours) if contours else classical_count
    classical_signal = estimate_classical_fronds(contours) if contours else classical_count

    if yolo_count > 0:
        final = round(0.65 * yolo_count + 0.35 * classical_signal)
        confidence = 0.78
        delta = abs(yolo_count - classical_signal)
        if delta <= 2:
            confidence += 0.12
        elif delta > max(3, yolo_count * 0.35):
            confidence -= min(0.28, 0.04 * delta)
    else:
        final = classical_signal
        connected_pairs = max(0, classical_signal - contour_count)
        confidence = 0.5 if connected_pairs else 0.55
        if final <= 75 and connected_pairs <= max(2, contour_count // 4):
            confidence += 0.04
        if final > 150:
            confidence = 0.28
        elif final > 75:
            confidence = min(confidence, 0.42)

    final = max(0, final)
    confidence = float(np.clip(confidence, 0.0, 1.0))

    return final, confidence
