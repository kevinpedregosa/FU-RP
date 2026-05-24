"""Async file helpers for image upload workflows."""

from pathlib import Path
import mimetypes
import re
import uuid

import aiofiles
from fastapi import HTTPException, UploadFile

from app.config import settings


ALLOWED_MIME_TYPES: frozenset[str] = frozenset(
    {"image/jpeg", "image/png", "image/tiff", "image/webp"}
)


def safe_filename(original: str) -> str:
    """Return a sanitized filename safe for local storage."""
    name = Path(original or f"upload_{uuid.uuid4().hex}").name
    name = name.replace(" ", "_")
    name = re.sub(r"[^A-Za-z0-9._-]", "", name)
    return (name or f"upload_{uuid.uuid4().hex}")[:200]


async def save_upload(file: UploadFile, dest_dir: Path, filename: str) -> Path:
    """Stream an upload to disk while enforcing the configured size limit."""
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_path = dest_dir / filename
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    total = 0

    try:
        async with aiofiles.open(dest_path, "wb") as out_file:
            while chunk := await file.read(1024 * 1024):
                total += len(chunk)
                if total > max_bytes:
                    await out_file.close()
                    dest_path.unlink(missing_ok=True)
                    raise HTTPException(status_code=413, detail="File too large")
                await out_file.write(chunk)
    except Exception:
        if dest_path.exists():
            dest_path.unlink(missing_ok=True)
        raise

    return dest_path


async def delete_file(path: Path) -> bool:
    """Delete a local file if it exists."""
    try:
        path.unlink()
        return True
    except FileNotFoundError:
        return False


def get_mime_type(path: Path) -> str:
    """Return a MIME type guessed from a path."""
    mime_type, _ = mimetypes.guess_type(path)
    return mime_type or "application/octet-stream"
