"use client";

import { motion } from "framer-motion";
import { Loader2, Zap } from "lucide-react";
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
      className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-16"
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold">Analyze Sample</h1>
        <p className="mt-3 text-muted-foreground">
          Upload a duckweed water sample image for automated frond counting
        </p>
      </div>
      {selectedFile ? (
        <div className="flex flex-col gap-4">
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
        <DropZone onFile={setSelectedFile} disabled={processing} />
      )}
      <UploadProgress state={state} />
    </motion.div>
  );
}
