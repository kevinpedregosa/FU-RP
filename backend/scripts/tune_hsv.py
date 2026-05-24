"""Interactively tune HSV green-mask values for real duckweed photos.

Run this script, point it at a real duckweed photo, adjust sliders until fronds
are cleanly isolated, then press S to save values for segmentation.py.
"""

import argparse
import sys
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).parent.parent))


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Tune HSV thresholds for duckweed frond segmentation."
    )
    parser.add_argument("--image", required=True, help="Path to the image file to tune.")
    return parser.parse_args()


def resize_for_display(image: np.ndarray, max_side: int = 1200) -> np.ndarray:
    """Resize an image so its longest side is at most max_side."""
    height, width = image.shape[:2]
    longest_side = max(height, width)
    if longest_side <= max_side:
        return image
    scale = max_side / longest_side
    return cv2.resize(
        image,
        (int(width * scale), int(height * scale)),
        interpolation=cv2.INTER_AREA,
    )


def noop(_value: int) -> None:
    """OpenCV trackbar callback placeholder."""


def create_trackbars(window_name: str) -> None:
    """Create HSV tuning trackbars."""
    cv2.createTrackbar("H Min", window_name, 25, 179, noop)
    cv2.createTrackbar("H Max", window_name, 85, 179, noop)
    cv2.createTrackbar("S Min", window_name, 40, 255, noop)
    cv2.createTrackbar("S Max", window_name, 255, 255, noop)
    cv2.createTrackbar("V Min", window_name, 60, 255, noop)
    cv2.createTrackbar("V Max", window_name, 255, 255, noop)


def read_hsv_values(window_name: str) -> dict[str, int]:
    """Read the current HSV trackbar values."""
    return {
        "h_min": cv2.getTrackbarPos("H Min", window_name),
        "h_max": cv2.getTrackbarPos("H Max", window_name),
        "s_min": cv2.getTrackbarPos("S Min", window_name),
        "s_max": cv2.getTrackbarPos("S Max", window_name),
        "v_min": cv2.getTrackbarPos("V Min", window_name),
        "v_max": cv2.getTrackbarPos("V Max", window_name),
    }


def build_mask(image: np.ndarray, values: dict[str, int]) -> np.ndarray:
    """Build a cleaned HSV mask from the current slider values."""
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    lower = np.array([values["h_min"], values["s_min"], values["v_min"]])
    upper = np.array([values["h_max"], values["s_max"], values["v_max"]])
    mask = cv2.inRange(hsv, lower, upper)

    kernel_open = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    kernel_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel_open)
    return cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel_close)


def find_filtered_contours(mask: np.ndarray) -> list[np.ndarray]:
    """Find contours in the mask and keep plausible frond-sized regions."""
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    return [contour for contour in contours if 80 <= cv2.contourArea(contour) <= 40000]


def make_preview(image: np.ndarray, mask: np.ndarray, contours: list[np.ndarray]) -> np.ndarray:
    """Build the side-by-side tuner preview image."""
    annotated = image.copy()
    cv2.drawContours(annotated, contours, -1, (0, 255, 0), 2)
    cv2.putText(
        annotated,
        f"Fronds detected: {len(contours)}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1.0,
        (0, 0, 0),
        4,
    )
    cv2.putText(
        annotated,
        f"Fronds detected: {len(contours)}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1.0,
        (255, 255, 255),
        2,
    )
    mask_bgr = cv2.cvtColor(mask, cv2.COLOR_GRAY2BGR)
    return cv2.hconcat([annotated, mask_bgr])


def print_values(values: dict[str, int]) -> None:
    """Print values in a copy-friendly form."""
    print("Current HSV values:")
    print(
        {
            "lower": [values["h_min"], values["s_min"], values["v_min"]],
            "upper": [values["h_max"], values["s_max"], values["v_max"]],
        }
    )
    print("Copy into segmentation.py:")
    print(
        "mask_a = cv2.inRange("
        "hsv, "
        f"np.array([{values['h_min']}, {values['s_min']}, {values['v_min']}]), "
        f"np.array([{values['h_max']}, {values['s_max']}, {values['v_max']}])"
        ")"
    )


def main() -> None:
    """Run the interactive HSV tuner."""
    args = parse_args()
    image_path = Path(args.image)
    image = cv2.imread(str(image_path))
    if image is None:
        print(f"Error: could not load image: {image_path}", file=sys.stderr)
        sys.exit(1)

    image = resize_for_display(image)
    window_name = "HSV Tuner"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    create_trackbars(window_name)

    values = read_hsv_values(window_name)
    try:
        while True:
            values = read_hsv_values(window_name)
            mask = build_mask(image, values)
            contours = find_filtered_contours(mask)
            preview = make_preview(image, mask, contours)
            cv2.imshow(window_name, preview)

            key = cv2.waitKey(30) & 0xFF
            if key == ord("s"):
                print_values(values)
                break
            if key == 27:
                break
    finally:
        cv2.destroyAllWindows()

    print_values(values)


if __name__ == "__main__":
    main()
