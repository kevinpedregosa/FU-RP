"""Visualization overlays for duckweed frond counting results."""

import cv2
import numpy as np


FROND_COLORS: list[tuple[int, int, int]] = [
    (0, 220, 80),
    (0, 180, 255),
    (255, 160, 0),
    (220, 0, 220),
    (0, 200, 200),
    (200, 200, 0),
]


def generate_overlay(
    original: np.ndarray,
    contours: list[np.ndarray],
    frond_count: int,
    confidence: float,
    yolo_masks: list | None = None,
) -> np.ndarray:
    """Draw colored frond overlays, contour IDs, and confidence annotations."""
    try:
        output = original.copy()

        if yolo_masks is not None:
            for i, mask in enumerate(yolo_masks):
                mask_bool = mask > 0.5
                if mask_bool.shape[:2] != output.shape[:2] or int(mask_bool.sum()) < 80:
                    continue
                color = FROND_COLORS[i % len(FROND_COLORS)]
                colored = np.zeros_like(output)
                colored[mask_bool] = color
                output = cv2.addWeighted(output, 1.0, colored, 0.22, 0)

        for i, contour in enumerate(contours):
            color = FROND_COLORS[i % len(FROND_COLORS)]
            cv2.drawContours(output, [contour], -1, color, 2)
            moments = cv2.moments(contour)
            if moments["m00"] == 0:
                continue
            cx = int(moments["m10"] / moments["m00"])
            cy = int(moments["m01"] / moments["m00"])
            cv2.circle(output, (cx, cy), 5, color, -1)
            label = f"#{i + 1}"
            cv2.putText(
                output,
                label,
                (cx - 11, cy - 9),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 0, 0),
                3,
            )
            cv2.putText(
                output,
                label,
                (cx - 12, cy - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 255, 255),
                1,
            )

        height, width = output.shape[:2]
        cv2.rectangle(output, (0, 0), (width, 44), (0, 0, 0), -1)
        cv2.putText(
            output,
            f"Fronds: {frond_count}",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.75,
            (255, 255, 255),
            2,
        )

        conf_text = f"Confidence: {confidence:.0%}"
        if confidence >= 0.8:
            conf_color = (80, 200, 80)
        elif confidence >= 0.6:
            conf_color = (80, 200, 255)
        else:
            conf_color = (80, 80, 255)
        text_width = cv2.getTextSize(conf_text, cv2.FONT_HERSHEY_SIMPLEX, 0.65, 2)[0][0]
        cv2.putText(
            output,
            conf_text,
            (max(10, width - text_width - 10), 29),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.65,
            conf_color,
            2,
        )

        if confidence < 0.6:
            cv2.rectangle(output, (0, 44), (width, 72), (0, 80, 200), -1)
            cv2.putText(
                output,
                "Low confidence - manual review recommended",
                (10, 64),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 255, 255),
                1,
            )

        return output
    except Exception:
        return original.copy()


def generate_heatmap(mask: np.ndarray) -> np.ndarray:
    """Create a JET heatmap visualization from a mask."""
    mask_uint8 = (mask * 255).astype(np.uint8) if mask.max() <= 1.0 else mask.astype(np.uint8)
    return cv2.applyColorMap(mask_uint8, cv2.COLORMAP_JET)
