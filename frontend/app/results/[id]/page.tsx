"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import ResultsDashboard from "@/components/results/ResultsDashboard";
import { getResult } from "@/lib/api";
import type { InferenceResponse } from "@/lib/types";

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "detail" in error) {
    return String(error.detail);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

export default function ResultPage() {
  const params = useParams();
  const [result, setResult] = useState<InferenceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = params.id as string;

  const fetchResult = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      setResult(await getResult(id));
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  if (loading) {
    return (
      <main className="page-fade min-h-screen bg-black px-6 pt-24 md:px-12">
        <div className="number text-[11px] text-[var(--text-ghost)]">Analysis / loading</div>
        <div className="mt-8 font-display text-[clamp(80px,12vw,160px)] leading-[0.82] text-[var(--text-ghost)]">
          ...
        </div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="page-fade flex min-h-screen items-center bg-black px-6 md:px-12">
        <div>
          <div className="label mb-5">RESULT UNAVAILABLE</div>
          <h1 className="font-display text-[clamp(56px,8vw,96px)] font-normal leading-[0.92] tracking-[-0.02em] text-white">
            Could not load
            <br />
            this analysis.
          </h1>
          <p className="mt-6 max-w-[520px] text-[var(--text-dim)]">{error || "No result was found."}</p>
          <Link
            href="/upload"
            className="mt-8 inline-block text-sm text-[var(--accent)] underline-offset-4 hover:underline"
          >
            → Upload another sample
          </Link>
        </div>
      </main>
    );
  }

  return <ResultsDashboard result={result} />;
}
