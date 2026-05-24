"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import type { UploadState } from "@/lib/types";
import { cn } from "@/lib/utils";

type UploadProgressProps = {
  state: UploadState;
};

const messages: Record<UploadState["status"], string> = {
  idle: "",
  uploading: "Uploading image...",
  inferring: "Running AI analysis...",
  done: "Analysis complete!",
  error: "Something went wrong",
};

export default function UploadProgress({ state }: UploadProgressProps) {
  if (state.status === "idle") {
    return null;
  }

  const processing = state.status === "uploading" || state.status === "inferring";
  const message = state.status === "error" ? state.error || messages.error : messages[state.status];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="rounded-xl border bg-card p-4"
      >
        <Progress value={state.progress} />
        <div className="mt-4 flex items-center gap-2">
          {processing ? (
            <Loader2 className="size-5 animate-spin text-primary" />
          ) : state.status === "done" ? (
            <CheckCircle2 className="size-5 text-green-500" />
          ) : (
            <XCircle className="size-5 text-red-500" />
          )}
          <span
            className={cn(
              "text-sm font-medium",
              state.status === "error" && "text-destructive"
            )}
          >
            {message}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
