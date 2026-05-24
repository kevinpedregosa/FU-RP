"""Evaluation metrics for counting and segmentation experiments."""

import math
from collections.abc import Sequence

import numpy as np


def mean_absolute_error(y_true: Sequence[float], y_pred: Sequence[float]) -> float:
    """Return mean absolute error for count predictions."""
    if len(y_true) == 0:
        return 0.0
    return float(sum(abs(a - b) for a, b in zip(y_true, y_pred)) / len(y_true))


def root_mean_squared_error(y_true: Sequence[float], y_pred: Sequence[float]) -> float:
    """Return root mean squared error for count predictions."""
    if len(y_true) == 0:
        return 0.0
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(y_true, y_pred)) / len(y_true))


def mask_iou(mask_a: np.ndarray, mask_b: np.ndarray) -> float:
    """Return intersection-over-union for two binary masks."""
    a = mask_a.astype(bool)
    b = mask_b.astype(bool)
    union = np.logical_or(a, b).sum()
    if union == 0:
        return 1.0
    intersection = np.logical_and(a, b).sum()
    return float(intersection / union)
