"""Integration tests for the FastAPI duckweed backend endpoints."""

import pytest
from httpx import AsyncClient

from app.main import app

pytestmark = pytest.mark.asyncio


@pytest.mark.asyncio
async def test_health_check_returns_ok() -> None:
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("ok", "degraded")
    assert "model_loaded" in data
    assert "version" in data


@pytest.mark.asyncio
async def test_health_check_response_structure() -> None:
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/health")
    data = response.json()
    assert set(data.keys()) >= {"status", "model_loaded", "environment", "version"}


@pytest.mark.asyncio
async def test_upload_rejects_non_image() -> None:
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/upload",
            files={"file": ("test.txt", b"not an image", "text/plain")},
        )
    assert response.status_code == 415


@pytest.mark.asyncio
async def test_upload_accepts_jpeg(sample_image_path) -> None:
    async with AsyncClient(app=app, base_url="http://test") as client:
        with open(sample_image_path, "rb") as f:
            response = await client.post(
                "/api/upload",
                files={"file": ("test.jpg", f, "image/jpeg")},
            )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["status"] == "pending"


@pytest.mark.asyncio
async def test_infer_returns_404_for_unknown_upload() -> None:
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/infer",
            json={"upload_id": "nonexistent-id-12345", "include_heatmap": False},
        )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_dataset_stats_returns_structure() -> None:
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/dataset/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "by_split" in data
