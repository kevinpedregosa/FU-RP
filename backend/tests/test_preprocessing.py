"""Unit tests for the image preprocessing pipeline."""

import cv2
import numpy as np
import pytest

from app.core.preprocessing import get_green_channel_stats, preprocess_image


def test_preprocess_returns_uint8(sample_bgr_image: np.ndarray) -> None:
    result = preprocess_image(sample_bgr_image)
    assert result.dtype == np.uint8


def test_preprocess_preserves_shape_when_small(sample_bgr_image: np.ndarray) -> None:
    result = preprocess_image(sample_bgr_image)
    assert result.shape == sample_bgr_image.shape


def test_preprocess_resizes_large_image() -> None:
    large = np.zeros((4000, 3000, 3), dtype=np.uint8)
    result = preprocess_image(large)
    assert max(result.shape[:2]) <= 1920


def test_preprocess_does_not_crash_on_grayscale() -> None:
    gray = np.zeros((200, 200), dtype=np.uint8)
    bgr = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
    result = preprocess_image(bgr)
    assert result is not None


def test_green_channel_stats_returns_dict(sample_bgr_image: np.ndarray) -> None:
    stats = get_green_channel_stats(sample_bgr_image)
    assert "mean_hue" in stats
    assert "std_sat" in stats
    assert "mean_val" in stats
    assert all(isinstance(v, float) for v in stats.values())
