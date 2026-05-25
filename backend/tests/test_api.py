"""Integration tests for the FastAPI duckweed backend endpoints."""

from datetime import datetime
import uuid

import pytest
from httpx import AsyncClient

from app.database import AsyncSessionLocal, init_db
from app.main import app
from app.models.db_models import InferenceResult, Upload

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


async def create_result_for_api_test() -> tuple[str, str]:
    upload_id = uuid.uuid4().hex
    result_id = uuid.uuid4().hex
    now = datetime.utcnow().isoformat()
    await init_db()
    async with AsyncSessionLocal() as session:
        upload = Upload(
            id=upload_id,
            filename="history-test.jpg",
            stored_path="missing-history-test.jpg",
            mime_type="image/jpeg",
            file_size=128,
            width=10,
            height=10,
            status="done",
            created_at=now,
            updated_at=now,
        )
        result = InferenceResult(
            id=result_id,
            upload_id=upload_id,
            frond_count=7,
            classical_count=6,
            yolo_count=8,
            confidence=0.84,
            model_version="duckweed_v1",
            processing_ms=123,
            overlay_path=None,
            contour_path=None,
            heatmap_path=None,
            raw_json="{}",
            created_at=now,
        )
        session.add(upload)
        session.add(result)
        await session.commit()
    return upload_id, result_id


@pytest.mark.asyncio
async def test_results_history_returns_recent_results() -> None:
    _, result_id = await create_result_for_api_test()

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/results/history")

    assert response.status_code == 200
    data = response.json()
    assert any(item["id"] == result_id for item in data)


@pytest.mark.asyncio
async def test_correct_count_updates_result() -> None:
    _, result_id = await create_result_for_api_test()

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.patch(
            f"/api/results/{result_id}/correct",
            json={"corrected_count": 12, "notes": "verified manually"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["result"]["frond_count"] == 12
    assert data["model_version"].endswith("_corrected")
