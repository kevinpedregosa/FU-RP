"""Run the full frond-counting inference pipeline on a local image file."""

import argparse
import asyncio
import json
import sys
import time
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.counting import count_fronds, estimate_lobes_in_contour
from app.core.overlay import generate_overlay
from app.core.preprocessing import preprocess_image
from app.core.segmentation import classical_pipeline
from app.utils.logging_config import setup_logging


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Test duckweed frond inference on a real image."
    )
    parser.add_argument("--image", required=True, help="Path to the image file to process.")
    parser.add_argument(
        "--save-overlay",
        action="store_true",
        help="Save an overlay image next to the input file.",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print per-contour area and lobe estimate details.",
    )
    return parser.parse_args()


def run_yolo(processed_image: np.ndarray) -> tuple[list[np.ndarray], int, float, list[np.ndarray]]:
    """Run YOLO inference if available, otherwise return an empty result."""
    try:
        from app.ml.yolo_inference import masks_to_contours, yolo_inference

        yolo_masks, yolo_count, yolo_conf = asyncio.run(yolo_inference(processed_image))
        yolo_contours = masks_to_contours(yolo_masks)
        return yolo_masks, yolo_count, yolo_conf, yolo_contours
    except (ImportError, Exception):
        return [], 0, 0.0, []


def print_results(
    image_path: Path,
    width: int,
    height: int,
    classical_count: int,
    yolo_count: int,
    final_count: int,
    confidence: float,
    processing_time: float,
    yolo_confidence: float,
) -> None:
    """Print a compact results table."""
    print("─────────────────────────────")
    print(f"Image:          {image_path.name}")
    print(f"Dimensions:     {width} x {height}")
    print(f"Classical count: {classical_count}")
    print(f"YOLO count:      {yolo_count}")
    print(f"Final count:     {final_count}")
    print(f"Confidence:      {confidence:.0%}")
    print(f"Processing time: {processing_time:.2f}s")
    print("─────────────────────────────")


def main() -> None:
    """Run inference on a local image and optionally save an overlay."""
    args = parse_args()
    setup_logging("INFO", "development")

    image_path = Path(args.image)
    image = cv2.imread(str(image_path))
    if image is None:
        print(f"Error: could not load image: {image_path}", file=sys.stderr)
        sys.exit(1)

    height, width = image.shape[:2]
    print(f"Image dimensions: {width} x {height}")

    start_time = time.time()
    processed = preprocess_image(image)
    _mask, classical_count, contours = classical_pipeline(processed)
    yolo_masks, yolo_count, yolo_conf, _yolo_contours = run_yolo(processed)
    final_count, confidence = count_fronds(
        contours=contours,
        yolo_masks=yolo_masks,
        yolo_count=yolo_count,
        classical_count=classical_count,
    )
    processing_time = time.time() - start_time

    print_results(
        image_path=image_path,
        width=width,
        height=height,
        classical_count=classical_count,
        yolo_count=yolo_count,
        final_count=final_count,
        confidence=confidence,
        processing_time=processing_time,
        yolo_confidence=yolo_conf,
    )

    if args.verbose:
        print("Contour details:")
        for index, contour in enumerate(contours, start=1):
            area = cv2.contourArea(contour)
            lobe_estimate = estimate_lobes_in_contour(contour)
            print(f"  {index:02d}. area={area:.1f}, lobe_estimate={lobe_estimate}")

    if args.save_overlay:
        overlay = generate_overlay(
            processed,
            contours,
            final_count,
            confidence,
            yolo_masks=yolo_masks,
        )
        overlay_path = image_path.with_name(f"{image_path.stem}_overlay{image_path.suffix}")
        if not cv2.imwrite(str(overlay_path), overlay):
            print(f"Error: could not save overlay: {overlay_path}", file=sys.stderr)
            sys.exit(1)
        print(f"Overlay saved:   {overlay_path}")


if __name__ == "__main__":
    main()
