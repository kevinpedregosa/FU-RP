"""Shared pytest fixtures for the duckweed backend test suite."""

from pathlib import Path

import cv2
import numpy as np
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import init_db
from app.main import app


@pytest_asyncio.fixture(autouse=True)
async def initialized_database() -> None:
    """Ensure API tests have the database schema even when ASGI lifespan is skipped."""
    await init_db()


@pytest.fixture
def sample_bgr_image() -> np.ndarray:
    """Creates a synthetic 400x400 BGR image simulating a duckweed sample.
    Grey background with 3 green ovals drawn on it.
    """
    img = np.full((400, 400, 3), (120, 110, 100), dtype=np.uint8)
    cv2.ellipse(img, (100, 100), (30, 20), 0, 0, 360, (60, 180, 60), -1)
    cv2.ellipse(img, (250, 150), (25, 18), 30, 0, 360, (50, 200, 50), -1)
    cv2.ellipse(img, (180, 280), (35, 22), 15, 0, 360, (70, 170, 70), -1)
    return img


@pytest.fixture
def sample_image_path(tmp_path: Path, sample_bgr_image: np.ndarray) -> Path:
    """Saves the synthetic image to a temp file and returns the path."""
    path = tmp_path / "test_duckweed.jpg"
    cv2.imwrite(str(path), sample_bgr_image)
    return path


@pytest.fixture
def small_blank_mask() -> np.ndarray:
    """Binary mask with 3 blobs, matching sample_bgr_image frond positions."""
    mask = np.zeros((400, 400), dtype=np.uint8)
    cv2.ellipse(mask, (100, 100), (30, 20), 0, 0, 360, 255, -1)
    cv2.ellipse(mask, (250, 150), (25, 18), 30, 0, 360, 255, -1)
    cv2.ellipse(mask, (180, 280), (35, 22), 15, 0, 360, 255, -1)
    return mask


@pytest.fixture
async def async_client() -> AsyncClient:
    """Async HTTP test client for the FastAPI app."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


__all__ = ["AsyncSession"]
