type UploadStatus = "pending" | "processing" | "done" | "failed";

type UploadResponse = {
  id: string;
  filename: string;
  status: UploadStatus;
  width: number | null;
  height: number | null;
  created_at: string;
};

type FrondCountResult = {
  frond_count: number;
  classical_count: number | null;
  yolo_count: number | null;
  confidence: number;
};

type InferenceResponse = {
  id: string;
  upload_id: string;
  result: FrondCountResult;
  model_version: string;
  processing_ms: number | null;
  overlay_url: string | null;
  contour_url: string | null;
  heatmap_url: string | null;
  created_at: string;
};

type UploadState = {
  status: "idle" | "uploading" | "inferring" | "done" | "error";
  uploadId: string | null;
  resultId: string | null;
  error: string | null;
  progress: number;
};

type ApiError = {
  detail: string;
  code: string | null;
};

type HealthResponse = {
  status: string;
  model_loaded: boolean;
  environment: string;
  version: string;
};

type DatasetStats = {
  total: number;
  by_split: { train: number; val: number; test: number };
  labeled: number;
};

export type {
  ApiError,
  DatasetStats,
  FrondCountResult,
  HealthResponse,
  InferenceResponse,
  UploadResponse,
  UploadState,
  UploadStatus,
};
