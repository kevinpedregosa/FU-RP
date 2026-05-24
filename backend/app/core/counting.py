"""Frond counting logic combining classical CV and YOLO results."""

import cv2
import numpy as np


def estimate_lobes_in_contour(contour: np.ndarray) -> int:
    """Estimate number of fronds in a single contour using convexity and area."""
    area = cv2.contourArea(contour)
    if area < 120:
        return 1

    perimeter = cv2.arcLength(contour, True)
    if perimeter == 0:
        return 1

    _circularity = (4 * np.pi * area) / (perimeter**2)

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

    defect_estimate = defect_count + 1
    area_estimate = max(1, round(area / 700))
    estimate = max(defect_estimate, area_estimate)
    return min(estimate, 6)


def count_fronds(
    contours: list,
    yolo_masks: list,
    yolo_count: int,
    classical_count: int,
) -> tuple[int, float]:
    """Merge classical and YOLO signals into final count and confidence."""
    if len(contours) == 0 and yolo_count == 0:
        return 0, 0.0

    classical_lobe_estimate = (
        sum(estimate_lobes_in_contour(c) for c in contours) if contours else classical_count
    )

    if yolo_count > 0:
        final = round(0.6 * yolo_count + 0.4 * classical_lobe_estimate)
    else:
        final = classical_lobe_estimate

    final = max(0, final)

    confidence = 0.7 if yolo_count > 0 else 0.5
    delta = abs(yolo_count - classical_lobe_estimate)
    if delta <= 2:
        confidence += 0.15
    elif delta > 3:
        confidence -= 0.1 * (delta - 3)
    confidence = float(np.clip(confidence, 0.0, 1.0))

    return final, confidence
