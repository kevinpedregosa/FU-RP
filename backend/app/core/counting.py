"""Frond counting logic for classical and YOLO detection signals."""

import cv2
import numpy as np


def _distance_peak_count(contour: np.ndarray) -> int:
    """Count distance-transform peaks inside one contour; each peak is one frond."""
    x, y, w, h = cv2.boundingRect(contour)
    if w <= 0 or h <= 0:
        return 1
    pad = 8
    shifted = contour - np.array([[[x - pad, y - pad]]])
    mask = np.zeros((h + pad * 2, w + pad * 2), dtype=np.uint8)
    cv2.drawContours(mask, [shifted], -1, 255, -1)
    dist = cv2.distanceTransform(mask, cv2.DIST_L2, 5)
    max_dist = float(dist.max())
    if max_dist <= 2:
        return 1

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))
    local_max_mask = (dist == cv2.dilate(dist, kernel)).astype(np.uint8)
    threshold = max(3.0, max_dist * 0.40)
    peaks = local_max_mask & (dist >= threshold).astype(np.uint8)
    n_peaks, _ = cv2.connectedComponents(peaks)
    return max(1, min(n_peaks - 1, 6))


def _reference_area(contours: list[np.ndarray]) -> float | None:
    """Estimate typical single-frond area from the smallest plausible contours."""
    areas = sorted(cv2.contourArea(c) for c in contours)
    plausible = [a for a in areas if 100 <= a <= 6000]
    if len(plausible) < 2:
        return None
    return float(np.median(plausible[: max(2, len(plausible) // 2)]))


def estimate_lobes_in_contour(
    contour: np.ndarray, reference_area: float | None = None
) -> int:
    """Return estimated frond count for one contour. Range: 1-4.

    Conservative: only call 2+ fronds when there is strong geometric evidence.
    This avoids over-counting when fronds are small or the image is a wide-field shot.
    """
    area = cv2.contourArea(contour)
    if area < 100:
        return 1

    peak_count = _distance_peak_count(contour)
    if peak_count >= 3:
        return min(peak_count, 4)
    if peak_count == 2:
        if reference_area and reference_area > 0:
            if area / reference_area >= 1.5:
                return 2
        else:
            return 2

    if reference_area and reference_area > 0:
        ratio = area / reference_area
        if ratio >= 2.6:
            return 3
        if ratio >= 1.8:
            return 2
    return 1


def estimate_classical_fronds(contours: list[np.ndarray]) -> int:
    """Estimate total fronds from classical contours."""
    if not contours:
        return 0
    ref = _reference_area(contours)
    return sum(estimate_lobes_in_contour(c, ref) for c in contours)


def count_fronds(
    contours: list,
    yolo_masks: list,
    yolo_count: int,
    classical_count: int,
) -> tuple[int, float]:
    """Fuse classical and YOLO counts into final estimate and confidence."""
    if not contours and yolo_count == 0:
        return 0, 0.0

    classical_signal = estimate_classical_fronds(contours) if contours else classical_count
    yolo_ratio = yolo_count / max(1, classical_signal)
    yolo_is_valid = (
        yolo_count > 0
        and classical_signal > 0
        and yolo_ratio >= 0.15
        and yolo_ratio <= 6.0
    )

    if yolo_is_valid:
        final = round(0.55 * yolo_count + 0.45 * classical_signal)
        confidence = 0.78
        delta = abs(yolo_count - classical_signal)
        if delta <= max(2, round(classical_signal * 0.15)):
            confidence += 0.12
        elif delta > max(4, round(classical_signal * 0.40)):
            confidence -= min(0.25, 0.04 * delta)
    else:
        final = classical_signal
        confidence = 0.55

    final = max(0, final)
    confidence = float(np.clip(confidence, 0.0, 1.0))
    return final, confidence
