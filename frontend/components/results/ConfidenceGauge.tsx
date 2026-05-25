"use client";

import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatConfidence } from "@/lib/utils";

type ConfidenceGaugeProps = {
  confidence: number;
  isLoading?: boolean;
};

export default function ConfidenceGauge({ confidence, isLoading = false }: ConfidenceGaugeProps) {
  const radius = 45;
  const dasharray = 2 * Math.PI * radius;
  const dashoffset = dasharray * (1 - confidence);
  const line =
    confidence >= 0.8
      ? { text: "High confidence", detail: "Detections are consistent.", className: "text-green-500" }
      : confidence >= 0.6
        ? {
            text: "Medium confidence",
            detail: "Review the overlay before export.",
            className: "text-yellow-600",
          }
        : {
            text: "Low confidence",
            detail: "Manual verification recommended.",
            className: "text-red-500",
          };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confidence Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-5">
        <svg viewBox="0 0 120 120" className="size-48">
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            fill="none"
          />
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#22c55e"
            strokeWidth="8"
            fill="none"
            strokeDasharray={dasharray}
            initial={{ strokeDashoffset: dasharray }}
            animate={{ strokeDashoffset: isLoading ? dasharray : dashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
          <text x="60" y="58" textAnchor="middle" className="fill-foreground text-2xl font-bold">
            {formatConfidence(confidence)}
          </text>
          <text
            x="60"
            y="76"
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            confidence
          </text>
        </svg>
        <div className="text-center">
          <p className={`text-sm font-medium ${line.className}`}>{line.text}</p>
          <p className="mt-1 text-sm text-muted-foreground">{line.detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}
