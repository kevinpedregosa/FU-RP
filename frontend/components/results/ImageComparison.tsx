"use client";

import Image from "next/image";

import { API_BASE_URL } from "@/lib/constants";

type ImageComparisonProps = {
  uploadId: string;
  originalUrl: string | null;
  overlayUrl: string | null;
};

export default function ImageComparison({
  uploadId,
  originalUrl,
  overlayUrl,
}: ImageComparisonProps) {
  const originalSrc = originalUrl ? `${API_BASE_URL}${originalUrl}` : null;
  const overlaySrc = overlayUrl ? `${API_BASE_URL}${overlayUrl}` : null;

  function renderImage(label: string, src: string | null, accent = false) {
    return (
      <div className="relative min-h-[260px] bg-white/[0.03] md:min-h-[360px]">
        {src ? (
          <Image
            src={src}
            alt={`${label} image for upload ${uploadId}`}
            fill
            className="object-contain"
            unoptimized
          />
        ) : (
          <div className="flex h-[260px] items-center justify-center text-sm text-[var(--text-ghost)] md:h-[360px]">
            image unavailable
          </div>
        )}
        <div
          className={`number absolute bottom-4 left-4 text-[9px] ${
            accent ? "text-[var(--accent)]" : "text-[var(--text-ghost)]"
          }`}
        >
          {label}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="label mb-5 text-[10px]">SEGMENTATION REVIEW</div>
      {renderImage("ORIGINAL", originalSrc)}
      <div className="border-t border-[var(--border)]">
        {renderImage("SEGMENTED", overlaySrc, true)}
      </div>
    </div>
  );
}
