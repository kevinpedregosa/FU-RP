"""Visualization overlay generation for frond counting results."""

import cv2
import numpy as np


def generate_overlay(
    original: np.ndarray,
    contours: list[np.ndarray],
    frond_count: int,
    confidence: float,
    yolo_masks: list | None = None,
) -> np.ndarray:
    """Draw segmentation overlay on image."""
    output = original.copy()

    if yolo_masks is not None and len(yolo_masks) > 0:
        colors = [(255, 100, 100), (100, 100, 255), (255, 200, 50), (100, 255, 200)]
        for i, mask in enumerate(yolo_masks):
            color = colors[i % len(colors)]
            colored = np.zeros_like(output)
            mask_bool = mask > 0.5
            if mask_bool.shape[:2] == output.shape[:2]:
                colored[mask_bool] = color
                output = cv2.addWeighted(output, 1.0, colored, 0.25, 0)

    frond_id = 1
    for cnt in contours:
        cv2.drawContours(output, [cnt], -1, (0, 220, 80), 2)
        moments = cv2.moments(cnt)
        if moments["m00"] != 0:
            cx = int(moments["m10"] / moments["m00"])
            cy = int(moments["m01"] / moments["m00"])
            cv2.circle(output, (cx, cy), 4, (0, 220, 80), -1)
            label = f"#{frond_id}"
            cv2.putText(
                output,
                label,
                (cx - 10, cy - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.45,
                (0, 0, 0),
                2,
            )
            cv2.putText(
                output,
                label,
                (cx - 10, cy - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.45,
                (255, 255, 255),
                1,
            )
        frond_id += 1

    h, w = output.shape[:2]
    cv2.rectangle(output, (0, 0), (w, 40), (0, 0, 0), -1)
    cv2.putText(
        output,
        f"Fronds: {frond_count}",
        (10, 28),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (255, 255, 255),
        2,
    )
    conf_text = f"Confidence: {confidence:.0%}"
    text_size = cv2.getTextSize(conf_text, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)[0]
    cv2.putText(
        output,
        conf_text,
        (w - text_size[0] - 10, 28),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (255, 255, 255),
        2,
    )

    return output


def generate_heatmap(mask: np.ndarray) -> np.ndarray:
    """Apply JET colormap to a binary mask."""
    mask_uint8 = (mask * 255).astype(np.uint8) if mask.max() <= 1.0 else mask.astype(np.uint8)
    return cv2.applyColorMap(mask_uint8, cv2.COLORMAP_JET)
