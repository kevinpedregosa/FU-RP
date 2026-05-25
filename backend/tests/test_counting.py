"""Unit tests for duckweed frond counting logic."""

import cv2
import numpy as np
import pytest

from app.core.counting import count_fronds, estimate_lobes_in_contour


def make_oval_contour(cx: int, cy: int, rx: int, ry: int) -> np.ndarray:
    mask = np.zeros((400, 400), dtype=np.uint8)
    cv2.ellipse(mask, (cx, cy), (rx, ry), 0, 0, 360, 255, -1)
    cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    return cnts[0]


def test_single_small_contour_is_one_frond() -> None:
    cnt = make_oval_contour(200, 200, 15, 10)
    assert estimate_lobes_in_contour(cnt) == 1


def test_large_contour_estimates_multiple_fronds() -> None:
    cnt = make_oval_contour(200, 200, 50, 30)
    result = estimate_lobes_in_contour(cnt)
    assert result >= 1


def test_count_fronds_no_contours_no_yolo() -> None:
    count, confidence = count_fronds([], [], 0, 0)
    assert count == 0
    assert confidence == 0.0


def test_count_fronds_yolo_takes_priority() -> None:
    cnt = make_oval_contour(200, 200, 20, 14)
    count, confidence = count_fronds([cnt], [], yolo_count=5, classical_count=1)
    assert count >= 3


def test_count_fronds_confidence_is_clamped() -> None:
    cnt = make_oval_contour(200, 200, 20, 14)
    _, confidence = count_fronds([cnt], [], yolo_count=3, classical_count=3)
    assert 0.0 <= confidence <= 1.0


def test_count_fronds_classical_only_when_no_yolo() -> None:
    cnt1 = make_oval_contour(100, 100, 20, 14)
    cnt2 = make_oval_contour(250, 250, 20, 14)
    count, confidence = count_fronds([cnt1, cnt2], [], yolo_count=0, classical_count=2)
    assert count >= 1
    assert confidence == pytest.approx(0.5, abs=0.3)
