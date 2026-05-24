export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const MAX_FILE_SIZE_MB = 50;

export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/tiff": [".tif", ".tiff"],
  "image/webp": [".webp"],
};

export const ACCEPTED_MIME_TYPES = Object.keys(ACCEPTED_IMAGE_TYPES);

export const CONFIDENCE_THRESHOLDS = { high: 0.8, medium: 0.6 };

export const POLL_INTERVAL_MS = 2000;

export const APP_NAME = "Duckweed Frond Counter";

export const APP_DESCRIPTION =
  "Automated duckweed frond counting using computer vision and deep learning";
