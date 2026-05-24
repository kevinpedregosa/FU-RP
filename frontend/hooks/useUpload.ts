import { useState } from "react";

import { runInference, uploadImage } from "@/lib/api";
import type { UploadState } from "@/lib/types";

const initialState: UploadState = {
  status: "idle",
  uploadId: null,
  resultId: null,
  error: null,
  progress: 0,
};

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "detail" in error) {
    return String(error.detail);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

export default function useUpload(): {
  state: UploadState;
  uploadAndInfer: (file: File) => Promise<void>;
  reset: () => void;
} {
  const [state, setState] = useState<UploadState>(initialState);

  async function uploadAndInfer(file: File): Promise<void> {
    setState((current) => ({
      ...current,
      status: "uploading",
      progress: 10,
      error: null,
    }));

    try {
      const uploadResponse = await uploadImage(file);
      setState((current) => ({
        ...current,
        uploadId: uploadResponse.id,
        progress: 50,
      }));
      await new Promise((resolve) => setTimeout(resolve, 300));
      setState((current) => ({
        ...current,
        status: "inferring",
        progress: 70,
      }));
      const inferenceResponse = await runInference(uploadResponse.id);
      setState((current) => ({
        ...current,
        resultId: inferenceResponse.id,
        progress: 100,
        status: "done",
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        status: "error",
        error: getErrorMessage(error),
      }));
    }
  }

  function reset(): void {
    setState(() => initialState);
  }

  return { state, uploadAndInfer, reset };
}
