"""Pydantic v2 schemas for the Duckweed Frond Counter API."""

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class InferenceRequest(BaseModel):
    upload_id: str
    include_heatmap: bool = False


class DatasetImageCreate(BaseModel):
    true_count: int
    annotation_type: str
    split: Literal["train", "val", "test"] = "train"
    annotated_by: Optional[str] = None


class RetrainRequest(BaseModel):
    model_architecture: Literal["yolov8n-seg", "yolov8s-seg"] = "yolov8n-seg"
    epochs: int = Field(default=50, le=300, ge=1)
    notes: Optional[str] = None
    model_config = ConfigDict(protected_namespaces=())


class UploadResponse(BaseModel):
    id: str
    filename: str
    status: str
    width: Optional[int]
    height: Optional[int]
    created_at: str
    model_config = ConfigDict(from_attributes=True)


class FrondCountResult(BaseModel):
    frond_count: int
    classical_count: Optional[int]
    yolo_count: Optional[int]
    confidence: float


class InferenceResponse(BaseModel):
    id: str
    upload_id: str
    result: FrondCountResult
    model_version: str
    processing_ms: Optional[int]
    overlay_url: Optional[str]
    contour_url: Optional[str]
    heatmap_url: Optional[str]
    created_at: str
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())


class DatasetImageResponse(BaseModel):
    id: str
    stored_path: str
    true_count: Optional[int]
    split: str
    annotation_type: Optional[str]
    created_at: str
    model_config = ConfigDict(from_attributes=True)


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    environment: str
    version: str
    model_config = ConfigDict(protected_namespaces=())


class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None
