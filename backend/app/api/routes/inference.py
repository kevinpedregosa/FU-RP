"""Inference routes for duckweed frond counting."""

from datetime import datetime
from pathlib import Path
import json
import time
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.db_models import InferenceResult, Upload
from app.models.schemas import FrondCountResult, InferenceRequest, InferenceResponse
from app.utils.image_utils import load_image, save_image
from app.utils.logging_config import get_logger


router = APIRouter(prefix="/api", tags=["inference"])
logger = get_logger(__name__)


async def get_upload_or_404(upload_id: str, db: AsyncSession) -> Upload:
    """Return an upload by ID or raise 404."""
    upload = await db.get(Upload, upload_id)
    if upload is None:
        raise HTTPException(status_code=404, detail="Upload not found")
    return upload


def _static_url(path_value: str | None) -> str | None:
    if not path_value:
        return None
    path = Path(path_value)
    if not path.exists():
        return None
    try:
        rel = path.relative_to(settings.STORAGE_DIR)
    except ValueError:
        rel = Path(path.name)
    return f"/static/{rel.as_posix()}"


def _build_response(result: InferenceResult, upload: Upload | None = None) -> InferenceResponse:
    return InferenceResponse(
        id=result.id,
        upload_id=result.upload_id,
        result=FrondCountResult(
            frond_count=result.frond_count,
            classical_count=result.classical_count,
            yolo_count=result.yolo_count,
            confidence=result.confidence,
        ),
        model_version=result.model_version,
        processing_ms=result.processing_ms,
        original_url=_static_url(upload.stored_path) if upload is not None else None,
        overlay_url=_static_url(result.overlay_path),
        contour_url=_static_url(result.contour_path),
        heatmap_url=_static_url(result.heatmap_path),
        created_at=result.created_at,
    )


@router.post("/infer", response_model=InferenceResponse)
async def infer(
    request: InferenceRequest, db: AsyncSession = Depends(get_db)
) -> InferenceResponse:
    """Run the frond counting pipeline for an upload."""
    upload = await get_upload_or_404(request.upload_id, db)
    upload.status = "processing"
    upload.updated_at = datetime.utcnow().isoformat()
    await db.commit()

    start_time = time.time()
    try:
        img = load_image(Path(upload.stored_path))

        from app.core.counting import count_fronds
        from app.core.overlay import generate_overlay
        from app.core.preprocessing import preprocess_image
        from app.core.segmentation import classical_pipeline
        from app.ml.yolo_inference import masks_to_contours, yolo_inference

        processed = preprocess_image(img)
        mask, classical_count, contours = classical_pipeline(processed)
        masks, yolo_count, avg_conf = await yolo_inference(processed)
        yolo_contours = masks_to_contours(masks)
        all_contours = yolo_contours if yolo_contours else contours
        final_count, confidence = count_fronds(
            contours=all_contours,
            yolo_masks=masks,
            yolo_count=yolo_count,
            classical_count=classical_count,
        )
        overlay_img = generate_overlay(
            processed,
            all_contours,
            final_count,
            confidence,
            yolo_masks=masks,
        )

        overlay_path = settings.STORAGE_DIR / "results" / f"{upload.id}_overlay.jpg"
        save_image(overlay_img, overlay_path)

        processing_ms = int((time.time() - start_time) * 1000)
        result = InferenceResult(
            id=uuid.uuid4().hex,
            upload_id=upload.id,
            frond_count=final_count,
            classical_count=classical_count,
            yolo_count=yolo_count,
            confidence=confidence,
            model_version="duckweed_v1",
            processing_ms=processing_ms,
            overlay_path=str(overlay_path),
            contour_path=None,
            heatmap_path=None,
            raw_json=json.dumps(
                {"classical": classical_count, "yolo": yolo_count, "yolo_confidence": avg_conf}
            ),
            created_at=datetime.utcnow().isoformat(),
        )
        upload.status = "done"
        upload.updated_at = datetime.utcnow().isoformat()
        db.add(result)
        await db.commit()
        await db.refresh(result)
        logger.info("inference_completed", upload_id=upload.id, result_id=result.id)
        return _build_response(result, upload)
    except Exception as exc:
        upload.status = "failed"
        upload.updated_at = datetime.utcnow().isoformat()
        await db.commit()
        logger.error("inference_failed", upload_id=upload.id, error=str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail="Inference failed") from exc


@router.get("/results/{result_id}", response_model=InferenceResponse)
async def get_result(
    result_id: str, db: AsyncSession = Depends(get_db)
) -> InferenceResponse:
    """Return an inference result by ID."""
    result = await db.get(InferenceResult, result_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Result not found")
    upload = await db.get(Upload, result.upload_id)
    return _build_response(result, upload)


@router.get("/results/by-upload/{upload_id}", response_model=InferenceResponse)
async def get_latest_result_for_upload(
    upload_id: str, db: AsyncSession = Depends(get_db)
) -> InferenceResponse:
    """Return the most recent inference result for an upload."""
    query = (
        select(InferenceResult)
        .where(InferenceResult.upload_id == upload_id)
        .order_by(InferenceResult.created_at.desc())
        .limit(1)
    )
    result = (await db.execute(query)).scalar_one_or_none()
    if result is None:
        raise HTTPException(status_code=404, detail="Result not found")
    upload = await db.get(Upload, result.upload_id)
    return _build_response(result, upload)
