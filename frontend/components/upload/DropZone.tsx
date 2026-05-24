"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export default function DropZone({ onFile, disabled }: DropZoneProps) {
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  const onDropAccepted = useCallback(
    (files: File[]) => {
      setRejectionError(null);
      onFile(files[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_FILE_SIZE_BYTES,
    multiple: false,
    disabled: disabled ?? false,
    onDropAccepted,
    onDropRejected: (rejections) => {
      const msg = rejections[0]?.errors[0]?.message ?? "File rejected";
      setRejectionError(msg);
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 cursor-pointer outline-none",
        "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
        isDragActive && "border-primary bg-primary/5 scale-[1.02]",
        rejectionError && "border-destructive bg-destructive/5",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none"
      )}
    >
      <input {...getInputProps()} />
      <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
        <Upload className="size-10" />
      </div>
      <p className="mb-1 text-lg font-semibold">Drop your image here</p>
      <p className="mb-3 text-sm text-muted-foreground">or click to browse</p>
      <p className="text-xs text-muted-foreground">
        JPEG · PNG · TIFF · WebP up to {MAX_FILE_SIZE_MB}MB
      </p>
      <AnimatePresence>
        {rejectionError ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 flex items-center gap-2 text-sm text-destructive"
          >
            <AlertCircle className="size-4" />
            {rejectionError}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
