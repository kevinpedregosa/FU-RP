"""SQLAlchemy ORM models for duckweed image uploads, inference, and training."""

from datetime import datetime
import uuid

from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _uuid_hex() -> str:
    return uuid.uuid4().hex


def _now_iso() -> str:
    return datetime.utcnow().isoformat()


class Upload(Base):
    """Uploaded image metadata."""

    __tablename__ = "uploads"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid_hex)
    filename: Mapped[str] = mapped_column(String)
    stored_path: Mapped[str] = mapped_column(String)
    mime_type: Mapped[str] = mapped_column(String)
    file_size: Mapped[int] = mapped_column(Integer)
    width: Mapped[int | None] = mapped_column(Integer)
    height: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String, default="pending")
    created_at: Mapped[str] = mapped_column(String, default=_now_iso)
    updated_at: Mapped[str] = mapped_column(String, default=_now_iso)
    results: Mapped[list["InferenceResult"]] = relationship(
        back_populates="upload", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"Upload(id={self.id!r}, filename={self.filename!r}, status={self.status!r})"


class InferenceResult(Base):
    """Frond count result generated from an uploaded image."""

    __tablename__ = "inference_results"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid_hex)
    upload_id: Mapped[str] = mapped_column(
        String, ForeignKey("uploads.id", ondelete="CASCADE")
    )
    frond_count: Mapped[int] = mapped_column(Integer)
    classical_count: Mapped[int | None] = mapped_column(Integer)
    yolo_count: Mapped[int | None] = mapped_column(Integer)
    confidence: Mapped[float] = mapped_column(Float)
    model_version: Mapped[str] = mapped_column(String)
    processing_ms: Mapped[int | None] = mapped_column(Integer)
    overlay_path: Mapped[str | None] = mapped_column(String)
    contour_path: Mapped[str | None] = mapped_column(String)
    heatmap_path: Mapped[str | None] = mapped_column(String)
    raw_json: Mapped[str | None] = mapped_column(String)
    created_at: Mapped[str] = mapped_column(String, default=_now_iso)
    upload: Mapped[Upload] = relationship(back_populates="results")

    def __repr__(self) -> str:
        return (
            f"InferenceResult(id={self.id!r}, upload_id={self.upload_id!r}, "
            f"frond_count={self.frond_count!r})"
        )


class DatasetImage(Base):
    """Curated image and label metadata used for model training."""

    __tablename__ = "dataset_images"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid_hex)
    upload_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("uploads.id"), nullable=True
    )
    stored_path: Mapped[str] = mapped_column(String)
    label_path: Mapped[str | None] = mapped_column(String)
    annotation_type: Mapped[str | None] = mapped_column(String)
    true_count: Mapped[int | None] = mapped_column(Integer)
    split: Mapped[str] = mapped_column(String, default="train")
    annotated_by: Mapped[str | None] = mapped_column(String)
    is_active: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[str] = mapped_column(String, default=_now_iso)
    updated_at: Mapped[str] = mapped_column(String, default=_now_iso)

    def __repr__(self) -> str:
        return f"DatasetImage(id={self.id!r}, split={self.split!r}, true_count={self.true_count!r})"


class ModelVersion(Base):
    """Tracked ML model version and validation metrics."""

    __tablename__ = "model_versions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid_hex)
    version_tag: Mapped[str] = mapped_column(String, unique=True)
    weights_path: Mapped[str] = mapped_column(String)
    architecture: Mapped[str] = mapped_column(String)
    val_mae: Mapped[float | None] = mapped_column(Float)
    val_rmse: Mapped[float | None] = mapped_column(Float)
    val_iou: Mapped[float | None] = mapped_column(Float)
    training_images: Mapped[int | None] = mapped_column(Integer)
    notes: Mapped[str | None] = mapped_column(String)
    is_active: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[str] = mapped_column(String, default=_now_iso)

    def __repr__(self) -> str:
        return f"ModelVersion(id={self.id!r}, version_tag={self.version_tag!r}, active={self.is_active!r})"
