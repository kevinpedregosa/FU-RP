import { API_BASE_URL } from "./constants";
import type {
  ApiError,
  DatasetStats,
  HealthResponse,
  InferenceResponse,
  UploadResponse,
} from "./types";

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network request failed";
    throw {
      detail: `Could not reach the backend at ${API_BASE_URL}. Make sure the FastAPI server is running on port 8000. (${message})`,
      code: "BACKEND_UNAVAILABLE",
    } satisfies ApiError;
  }

  if (!response.ok) {
    let error: ApiError = { detail: response.statusText, code: `HTTP_${response.status}` };
    try {
      error = (await response.json()) as ApiError;
    } catch {
      throw error;
    }
    throw error;
  }

  return (await response.json()) as T;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function uploadImage(file: File): Promise<UploadResponse> {
  const body = new FormData();
  body.append("file", file);

  return fetchJson<UploadResponse>("/api/upload", {
    method: "POST",
    body,
  });
}

export async function runInference(
  uploadId: string,
  includeHeatmap = false
): Promise<InferenceResponse> {
  return fetchJson<InferenceResponse>("/api/infer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ upload_id: uploadId, include_heatmap: includeHeatmap }),
  });
}

export async function getResult(
  resultId: string,
  signal?: AbortSignal
): Promise<InferenceResponse> {
  return fetchJson<InferenceResponse>(`/api/results/${resultId}`, { signal });
}

export async function getResultByUpload(uploadId: string): Promise<InferenceResponse> {
  return fetchJson<InferenceResponse>(`/api/results/by-upload/${uploadId}`);
}

export async function getHealth(): Promise<HealthResponse> {
  return fetchJson<HealthResponse>("/api/health");
}

export async function getDatasetStats(): Promise<DatasetStats> {
  return fetchJson<DatasetStats>("/api/dataset/stats");
}

export function exportResultJson(result: InferenceResponse): void {
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
  triggerDownload(blob, `frond_result_${result.id}.json`);
}

export function exportResultCsv(result: InferenceResponse): void {
  const csv = [
    "id,upload_id,frond_count,classical_count,yolo_count,confidence,model_version,processing_ms,created_at",
    [
      result.id,
      result.upload_id,
      result.result.frond_count,
      result.result.classical_count ?? "",
      result.result.yolo_count ?? "",
      result.result.confidence,
      result.model_version,
      result.processing_ms ?? "",
      result.created_at,
    ].join(","),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, `frond_result_${result.id}.csv`);
}

export async function correctCount(
  resultId: string,
  correctedCount: number,
  notes?: string
): Promise<InferenceResponse> {
  return fetchJson<InferenceResponse>(`/api/results/${resultId}/correct`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ corrected_count: correctedCount, notes: notes ?? "" }),
  });
}
