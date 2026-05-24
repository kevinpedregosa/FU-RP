import { useEffect, useState } from "react";

import { getResult } from "@/lib/api";
import type { InferenceResponse } from "@/lib/types";

function getErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "";
  }
  if (typeof error === "object" && error !== null && "detail" in error) {
    return String(error.detail);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

export default function useResults(resultId: string | null): {
  result: InferenceResponse | null;
  loading: boolean;
  error: string | null;
} {
  const [result, setResult] = useState<InferenceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resultId === null) {
      setResult(null);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getResult(resultId, controller.signal)
      .then((response) => {
        setResult(response);
      })
      .catch((caught) => {
        const message = getErrorMessage(caught);
        if (message) {
          setError(message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [resultId]);

  return { result, loading, error };
}
