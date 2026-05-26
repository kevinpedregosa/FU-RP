"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE_BYTES,
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
        "flex min-h-[280px] cursor-pointer flex-col items-center justify-center border border-[var(--border)] bg-transparent p-12 text-center transition-colors duration-200 ease-out",
        isDragActive && "border-[var(--accent)] bg-[var(--accent-dim)]",
        rejectionError && "border-[var(--red-signal)]",
        disabled && "pointer-events-none cursor-not-allowed opacity-50"
      )}
    >
      <input {...getInputProps()} suppressHydrationWarning />
      <span
        className={cn(
          "dot-pulse size-2 rounded-full bg-[var(--accent)]",
          isDragActive && "size-3"
        )}
      />
      <div className="mt-4 text-[15px] text-[var(--text-primary)]">Drop image here</div>
      <div className="mt-1 text-[13px] text-[var(--text-dim)]">or click to select a file</div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {["JPEG", "PNG", "TIFF", "WEBP"].map((type) => (
          <span
            key={type}
            className="border border-white/15 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-[var(--text-ghost)]"
          >
            {type}
          </span>
        ))}
      </div>
      {rejectionError ? (
        <div className="mt-5 text-xs text-[var(--red-signal)]">{rejectionError}</div>
      ) : null}
    </div>
  );
}
