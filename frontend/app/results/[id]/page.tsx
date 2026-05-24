"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import ResultsDashboard from "@/components/results/ResultsDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  const router = useRouter();
  const [result, setResult] = useState<InferenceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = params.id as string;

  const fetchResult = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await getResult(id);
      setResult(response);
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-[360px] rounded-xl" />
          <Skeleton className="h-[360px] rounded-xl" />
          <Skeleton className="h-[240px] rounded-xl" />
          <Skeleton className="h-[240px] rounded-xl" />
        </div>
      </motion.div>
    );
  }

  if (error || !result) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-xl px-4 py-20">
        <Card>
          <CardContent className="flex flex-col items-center gap-5 p-8 text-center">
            <AlertCircle className="size-12 text-destructive" />
            <div>
              <h1 className="text-2xl font-bold">Result unavailable</h1>
              <p className="mt-2 text-muted-foreground">{error || "No result was found."}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" onClick={() => router.push("/upload")}>
                <ArrowLeft data-icon="inline-start" />
                Back to Upload
              </Button>
              <Button onClick={fetchResult}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <ResultsDashboard result={result} />
    </motion.div>
  );
}
