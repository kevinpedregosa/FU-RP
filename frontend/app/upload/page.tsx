"use client";

import { motion } from "framer-motion";
import { Camera, CheckCircle2, Loader2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import DropZone from "@/components/upload/DropZone";
import ImagePreview from "@/components/upload/ImagePreview";
import UploadProgress from "@/components/upload/UploadProgress";
import { Button } from "@/components/ui/button";
import useUpload from "@/hooks/useUpload";

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();
  const { state, uploadAndInfer } = useUpload();
  const processing = state.status === "uploading" || state.status === "inferring";

  useEffect(() => {
    if (state.status === "done" && state.resultId) {
      router.push(`/results/${state.resultId}`);
    }
  }, [router, state.resultId, state.status]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12"
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold">Analyze Sample</h1>
        <p className="mt-3 text-muted-foreground">
          Upload a clear top-down photo and review the estimate before using it.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          "Keep the cup centered in frame",
          "Use even light without glare",
          "Separate dense clumps when possible",
        ].map((tip) => (
          <div key={tip} className="flex items-start gap-3 rounded-lg border bg-card p-4">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
            <span className="text-sm leading-6 text-muted-foreground">{tip}</span>
          </div>
        ))}
      </div>
      {selectedFile ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <ImagePreview file={selectedFile} onRemove={() => !processing && setSelectedFile(null)} />
          <Button
            size="lg"
            className="w-full"
            disabled={!selectedFile || processing}
            onClick={() => selectedFile && uploadAndInfer(selectedFile)}
          >
            {processing ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Zap data-icon="inline-start" />
            )}
            Analyze
          </Button>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-2xl">
          <DropZone onFile={setSelectedFile} disabled={processing} />
        </div>
      )}
      <div className="mx-auto flex max-w-2xl items-start gap-3 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
        <Camera className="mt-0.5 size-5 shrink-0 text-primary" />
        <span>
          Current counting is calibrated for bright green fronds. Bubbles, algae film,
          cup rims, and shadows can still trigger a low-confidence result.
        </span>
      </div>
      <UploadProgress state={state} />
    </motion.div>
  );
}
