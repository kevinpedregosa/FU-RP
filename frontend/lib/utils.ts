import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) {
    return "text-green-500";
  }
  if (confidence >= 0.6) {
    return "text-yellow-500";
  }
  return "text-red-500";
}

export function getConfidenceBadgeVariant(
  confidence: number
): "default" | "secondary" | "destructive" {
  if (confidence >= 0.8) {
    return "default";
  }
  if (confidence >= 0.6) {
    return "secondary";
  }
  return "destructive";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(bytes < 1024 * 100 ? 1 : 0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatProcessingTime(ms: number | null): string {
  if (ms === null) {
    return "—";
  }
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoString));
}
