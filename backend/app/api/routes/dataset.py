"""Dataset administration routes for training image management."""

from datetime import datetime
from pathlib import Path
from typing import Optional
import uuid

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.db_models import DatasetImage
from app.models.schemas import DatasetImageResponse, RetrainRequest
from app.utils.file_utils import safe_filename, save_upload
from app.utils.logging_config import get_logger


router = APIRouter(prefix="/api", tags=["dataset"])
logger = get_logger(__name__)


@router.post("/dataset/upload", response_model=DatasetImageResponse)
async def upload_dataset_image(
    image: UploadFile = File(...),
    label: Optional[UploadFile] = File(None),
    true_count: Optional[int] = Form(None),
    annotation_type: str = Form("yolo_seg"),
    split: str = Form("train"),
    annotated_by: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
) -> DatasetImageResponse:
    """Upload a dataset image and optional label file."""
    if split not in {"train", "val", "test"}:
        raise HTTPException(status_code=400, detail="Invalid split")

    now = datetime.utcnow().isoformat()
    image_id = uuid.uuid4().hex
    image_name = f"{image_id}_{safe_filename(image.filename or 'image')}"
    image_path = await save_upload(
        image, settings.STORAGE_DIR / "dataset" / "labeled" / "images", image_name
    )

    label_path: Path | None = None
    if label is not None and label.filename:
        label_name = f"{image_id}_{safe_filename(label.filename)}"
        label_path = await save_upload(
            label, settings.STORAGE_DIR / "dataset" / "labeled" / "labels", label_name
        )

    dataset_image = DatasetImage(
        id=image_id,
        upload_id=None,
        stored_path=str(image_path),
        label_path=str(label_path) if label_path else None,
        annotation_type=annotation_type,
        true_count=true_count,
        split=split,
        annotated_by=annotated_by,
        is_active=1,
        created_at=now,
        updated_at=now,
    )
    db.add(dataset_image)
    await db.commit()
    await db.refresh(dataset_image)
    logger.info("dataset_image_created", image_id=image_id, split=split)
    return DatasetImageResponse.model_validate(dataset_image)


@router.get("/dataset/images", response_model=list[DatasetImageResponse])
async def list_dataset_images(
    split: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
) -> list[DatasetImageResponse]:
    """List active dataset images with optional split filtering."""
    query = select(DatasetImage).where(DatasetImage.is_active == 1)
    if split is not None:
        query = query.where(DatasetImage.split == split)
    query = query.offset(offset).limit(limit)
    rows = (await db.execute(query)).scalars().all()
    return [DatasetImageResponse.model_validate(row) for row in rows]


@router.get("/dataset/stats")
async def dataset_stats(db: AsyncSession = Depends(get_db)) -> dict:
    """Return aggregate dataset statistics."""
    total = await db.scalar(
        select(func.count()).select_from(DatasetImage).where(DatasetImage.is_active == 1)
    )
    labeled = await db.scalar(
        select(func.count())
        .select_from(DatasetImage)
        .where(DatasetImage.is_active == 1, DatasetImage.true_count.is_not(None))
    )
    by_split: dict[str, int] = {}
    for split in ("train", "val", "test"):
        count = await db.scalar(
            select(func.count())
            .select_from(DatasetImage)
            .where(DatasetImage.is_active == 1, DatasetImage.split == split)
        )
        by_split[split] = int(count or 0)
    return {"total": int(total or 0), "by_split": by_split, "labeled": int(labeled or 0)}


@router.post("/dataset/retrain")
async def retrain_model(
    request: RetrainRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Start a background YOLO retraining job."""
    labeled = await db.scalar(
        select(func.count())
        .select_from(DatasetImage)
        .where(DatasetImage.is_active == 1, DatasetImage.true_count.is_not(None))
    )
    if int(labeled or 0) < 10:
        raise HTTPException(status_code=400, detail="At least 10 labeled images are required")

    version_tag = f"{request.model_architecture}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

    from app.ml.yolo_trainer import start_training

    background_tasks.add_task(
        start_training,
        version_tag=version_tag,
        architecture=request.model_architecture,
        epochs=request.epochs,
        notes=request.notes,
    )
    return {"status": "training_started", "job_id": version_tag}
