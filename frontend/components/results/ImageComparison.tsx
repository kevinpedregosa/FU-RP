"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ZoomIn, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [modalSrc, setModalSrc] = useState<string | null>(null);
  const originalSrc = originalUrl ? `${API_BASE_URL}${originalUrl}` : null;
  const overlaySrc = overlayUrl ? `${API_BASE_URL}${overlayUrl}` : null;

  function renderPanel(label: string, src: string | null, segmented = false) {
    return (
      <div className="relative h-[260px] overflow-hidden rounded-lg border bg-muted">
        <Badge className="absolute left-3 top-3 z-10" variant={segmented ? "default" : "secondary"}>
          {label}
        </Badge>
        {src ? (
          <>
            <Image
              src={src}
              alt={`${label} image for upload ${uploadId}`}
              fill
              className="object-cover"
              unoptimized
            />
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-3 right-3 z-10"
              onClick={() => setModalSrc(src)}
              aria-label={`Zoom ${label}`}
            >
              <ZoomIn />
            </Button>
          </>
        ) : (
          <Skeleton className="h-[260px] w-full" />
        )}
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Segmentation Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {renderPanel("Original", originalSrc)}
            {renderPanel("Segmented", overlaySrc, true)}
          </div>
        </CardContent>
      </Card>
      <AnimatePresence>
        {modalSrc ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex min-h-[400px] items-center justify-center bg-black/80 p-6"
            onClick={() => setModalSrc(null)}
          >
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-6 top-6"
              onClick={() => setModalSrc(null)}
              aria-label="Close modal"
            >
              <X />
            </Button>
            <div className="relative h-[80vh] w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
              <Image src={modalSrc} alt="Fullscreen result" fill className="object-contain" unoptimized />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
