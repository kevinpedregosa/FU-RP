"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Leaf } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FrondCountResult } from "@/lib/types";
import {
  formatConfidence,
  getConfidenceBadgeVariant,
  getConfidenceColor,
} from "@/lib/utils";

type FrondCountCardProps = {
  result: FrondCountResult | null;
  isLoading?: boolean;
};

export default function FrondCountCard({ result, isLoading = false }: FrondCountCardProps) {
  const [displayedCount, setDisplayedCount] = useState(0);
  const needsReview = result ? result.confidence < 0.6 : false;

  useEffect(() => {
    if (!result) {
      setDisplayedCount(0);
      return;
    }

    const duration = 1200;
    const stepMs = 30;
    const steps = duration / stepMs;
    let currentStep = 0;
    const interval = window.setInterval(() => {
      currentStep += 1;
      const progress = Math.min(currentStep / steps, 1);
      setDisplayedCount(Math.round(result.frond_count * progress));
      if (progress >= 1) {
        window.clearInterval(interval);
      }
    }, stepMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [result]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="size-5 text-primary" />
          Frond Count
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || !result ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-24 w-40" />
            <Skeleton className="h-5 w-36" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="font-mono text-7xl font-bold text-primary md:text-8xl">
              {displayedCount}
            </div>
            <div className="mt-2 text-muted-foreground">
              estimated fronds
            </div>
            {needsReview ? (
              <div className="mt-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                <span>
                  Low confidence. Check the overlay and manually verify this sample before
                  reporting the count.
                </span>
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge
                variant={getConfidenceBadgeVariant(result.confidence)}
                className={getConfidenceColor(result.confidence)}
              >
                Confidence: {formatConfidence(result.confidence)}
              </Badge>
              {result.classical_count !== null ? (
                <Badge variant="secondary">Classical: {result.classical_count}</Badge>
              ) : null}
              {result.yolo_count !== null ? (
                <Badge variant="secondary">YOLO: {result.yolo_count}</Badge>
              ) : null}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
