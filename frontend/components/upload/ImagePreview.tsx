"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { formatFileSize } from "@/lib/utils";

type ImagePreviewProps = {
  file: File;
  onRemove: () => void;
};

export default function ImagePreview({ file, onRemove }: ImagePreviewProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div>
      <div className="relative max-h-[240px] min-h-[160px] border-b border-[var(--border)] bg-white/[0.03]">
        {url ? (
          <Image src={url} alt={file.name} fill className="object-contain" unoptimized />
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="min-w-0">
          <div className="number truncate text-[13px] text-white">{file.name}</div>
          <div className="number mt-1 text-[11px] text-[var(--text-ghost)]">
            {formatFileSize(file.size)}
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-2xl leading-none text-[var(--text-ghost)] transition-colors duration-200 hover:text-white"
          aria-label="Remove image"
        >
          ×
        </button>
      </div>
    </div>
  );
}
