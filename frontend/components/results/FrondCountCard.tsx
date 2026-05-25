"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Leaf, Pencil, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { correctCount } from "@/lib/api";
import type { FrondCountResult } from "@/lib/types";
import { formatConfidence, getConfidenceBadgeVariant } from "@/lib/utils";

type FrondCountCardProps = {
  result: FrondCountResult;
  resultId: string;
  isLoading?: boolean;
  onCorrected?: (newCount: number) => void;
  modelVersion?: string;
};

export default function FrondCountCard({
  result,
  resultId,
  isLoading = false,
  onCorrected,
  modelVersion,
}: FrondCountCardProps) {
  const [currentCount, setCurrentCount] = useState(result.frond_count);
  const [displayCount, setDisplayCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [correctionError, setCorrectionError] = useState<string | null>(null);
  const [wasCorrected, setWasCorrected] = useState(modelVersion?.includes("_corrected") ?? false);
  const isCorrected = wasCorrected || (modelVersion?.includes("_corrected") ?? false);

  useEffect(() => {
    setCurrentCount(result.frond_count);
    const duration = 1200;
    const stepMs = 30;
    const steps = Math.max(1, Math.ceil(duration / stepMs));
    let current = 0;

    setDisplayCount(0);
    const interval = window.setInterval(() => {
      const remaining = result.frond_count - current;
      current += Math.ceil(remaining / steps);
      if (current >= result.frond_count) {
        current = result.frond_count;
        window.clearInterval(interval);
      }
      setDisplayCount(current);
    }, stepMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [result]);

  async function saveCorrection() {
    const parsed = Number.parseInt(editValue, 10);
    if (!Number.isInteger(parsed) || parsed < 0) {
      setCorrectionError("Enter a non-negative count.");
      return;
    }

    setSaving(true);
    setCorrectionError(null);
    try {
      await correctCount(resultId, parsed);
      setCurrentCount(parsed);
      setDisplayCount(parsed);
      setWasCorrected(true);
      onCorrected?.(parsed);
      setEditing(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save correction.";
      setCorrectionError(message);
    } finally {
      setSaving(false);
    }
  }

  function startEditing() {
    setEditValue(String(currentCount));
    setCorrectionError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setCorrectionError(null);
    setEditing(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="size-5 text-primary" />
          Frond Count
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-24 w-40" />
            <Skeleton className="h-5 w-36" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">
            {editing ? (
              <div className="flex flex-col gap-3">
                <input
                  type="number"
                  min="0"
                  max="9999"
                  value={editValue}
                  onChange={(event) => setEditValue(event.target.value)}
                  className="h-20 rounded-md border bg-background px-4 text-center font-mono text-4xl font-bold text-primary outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  autoFocus
                />
                <div className="flex items-center justify-center gap-2">
                  <Button size="sm" onClick={saveCorrection} disabled={saving}>
                    <Check data-icon="inline-start" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEditing} disabled={saving}>
                    <X data-icon="inline-start" />
                    Cancel
                  </Button>
                </div>
                {correctionError ? (
                  <p className="text-center text-sm text-destructive">{correctionError}</p>
                ) : null}
              </div>
            ) : (
              <div>
                <div className="flex items-start gap-2">
                  <div className="font-mono text-8xl font-bold text-primary">
                    {displayCount}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startEditing}
                    aria-label="Edit frond count"
                  >
                    <Pencil data-icon="inline-start" />
                  </Button>
                </div>
                <div className="text-muted-foreground">fronds detected</div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Badge variant={getConfidenceBadgeVariant(result.confidence)}>
                Confidence: {formatConfidence(result.confidence)}
              </Badge>
              {result.classical_count !== null ? (
                <Badge variant="secondary">Classical: {result.classical_count}</Badge>
              ) : null}
              {result.yolo_count !== null ? (
                <Badge variant="secondary">YOLO: {result.yolo_count}</Badge>
              ) : null}
              {isCorrected ? (
                <Badge className="border-amber-300 bg-amber-100 text-amber-900">
                  Manually corrected
                </Badge>
              ) : null}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
