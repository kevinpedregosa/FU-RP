"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, RefreshCw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InferenceResponse } from "@/lib/types";

import ConfidenceGauge from "./ConfidenceGauge";
import ExportPanel from "./ExportPanel";
import FrondCountCard from "./FrondCountCard";
import ImageComparison from "./ImageComparison";

type ResultsDashboardProps = {
  result: InferenceResponse;
};

const variants = {
  container: { transition: { staggerChildren: 0.1 } },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
};

export default function ResultsDashboard({ result }: ResultsDashboardProps) {
  const router = useRouter();
  const [correctedCount, setCorrectedCount] = useState<number | null>(null);
  const needsReview = result.result.confidence < 0.6;

  return (
    <motion.div
      variants={variants.container}
      initial="initial"
      animate="animate"
      className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8"
    >
      <motion.div variants={variants.item} className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <Button variant="outline" onClick={() => router.push("/upload")}>
            <ArrowLeft data-icon="inline-start" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Analysis Results</h1>
          <Button onClick={() => router.push("/upload")}>
            <RefreshCw data-icon="inline-start" />
            New Analysis
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{result.model_version}</Badge>
          <Badge variant="outline">Upload {result.upload_id.slice(0, 12)}...</Badge>
        </div>
        {correctedCount !== null ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900"
          >
            <span>Count manually updated to {correctedCount}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCorrectedCount(null)}
              aria-label="Dismiss correction message"
            >
              <X />
            </Button>
          </motion.div>
        ) : null}
        {needsReview ? (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <span>
              This result needs review. The counter found possible duckweed regions, but
              image artifacts may be affecting the estimate.
            </span>
          </div>
        ) : null}
      </motion.div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div variants={variants.item} className="flex flex-col gap-6">
          <ImageComparison
            uploadId={result.upload_id}
            originalUrl={result.original_url}
            overlayUrl={result.overlay_url}
          />
          <ExportPanel result={result} />
        </motion.div>
        <motion.div variants={variants.item} className="flex flex-col gap-6">
          <FrondCountCard
            result={result.result}
            resultId={result.id}
            modelVersion={result.model_version}
            onCorrected={(n) => setCorrectedCount(n)}
          />
          <ConfidenceGauge confidence={result.result.confidence} />
        </motion.div>
      </div>
    </motion.div>
  );
}
