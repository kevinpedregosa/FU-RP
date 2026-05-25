"""Unit tests for the classical segmentation pipeline."""

import cv2
import numpy as np
import pytest

from app.core.segmentation import classical_pipeline


def test_classical_pipeline_returns_tuple(sample_bgr_image: np.ndarray) -> None:
    mask, count, contours = classical_pipeline(sample_bgr_image)
    assert isinstance(mask, np.ndarray)
    assert isinstance(count, int)
    assert isinstance(contours, list)


def test_classical_pipeline_detects_green_fronds(sample_bgr_image: np.ndarray) -> None:
    mask, count, contours = classical_pipeline(sample_bgr_image)
    assert count >= 1


def test_classical_pipeline_mask_is_binary(sample_bgr_image: np.ndarray) -> None:
    mask, _, _ = classical_pipeline(sample_bgr_image)
    unique_vals = set(np.unique(mask))
    assert unique_vals.issubset({0, 255})


def test_classical_pipeline_handles_blank_image() -> None:
    blank = np.zeros((400, 400, 3), dtype=np.uint8)
    mask, count, contours = classical_pipeline(blank)
    assert count == 0
    assert contours == []


def test_classical_pipeline_filters_tiny_noise() -> None:
    img = np.full((400, 400, 3), (120, 110, 100), dtype=np.uint8)
    cv2.ellipse(img, (200, 200), (40, 28), 0, 0, 360, (60, 180, 60), -1)
    _, count, contours = classical_pipeline(img)
    assert count >= 1
    for cnt in contours:
        assert cv2.contourArea(cnt) >= 80
