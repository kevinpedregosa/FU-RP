"""Image upload routes for the Duckweed Frond Counter API."""

from datetime import datetime
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.db_models import Upload
from app.models.schemas import UploadResponse
from app.utils.file_utils import (
    ALLOWED_MIME_TYPES,
    get_mime_type,
    safe_filename,
    save_upload,
)
from app.utils.image_utils import get_image_dimensions
from app.utils.logging_config import get_logger


router = APIRouter(prefix="/api", tags=["upload"])
logger = get_logger(__name__)


@router.post("/upload", response_model=UploadResponse)
async def upload_image(
    file: UploadFile = File(...), db: AsyncSession = Depends(get_db)
) -> UploadResponse:
    """Store an uploaded image and persist metadata."""
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported media type")

    file_id = uuid.uuid4().hex
    safe_name = f"{file_id}_{safe_filename(file.filename or 'upload')}"
    dest_dir = settings.STORAGE_DIR / "uploads"

    try:
        stored_path = await save_upload(file, dest_dir, safe_name)
        width, height = get_image_dimensions(stored_path)
        now = datetime.utcnow().isoformat()
        upload = Upload(
            id=file_id,
            filename=file.filename or safe_name,
            stored_path=str(stored_path),
            mime_type=get_mime_type(stored_path),
            file_size=stored_path.stat().st_size,
            width=width,
            height=height,
            status="pending",
            created_at=now,
            updated_at=now,
        )
        db.add(upload)
        await db.commit()
        await db.refresh(upload)
        logger.info("upload_created", file_id=file_id, filename=upload.filename)
        return UploadResponse.model_validate(upload)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("upload_failed", filename=file.filename, error=str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail="Upload failed") from exc
