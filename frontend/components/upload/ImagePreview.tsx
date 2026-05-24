"use client";

import { motion } from "framer-motion";
import { FileImage, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="flex flex-col gap-4 p-4 sm:flex-row">
        <div className="relative size-[120px] shrink-0 overflow-hidden rounded-xl bg-muted">
          {url ? (
            <Image src={url} alt={file.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex size-full items-center justify-center">
              <FileImage className="size-10 text-muted-foreground" />
            </div>
          )}
          <Button
            size="icon"
            variant="destructive"
            className="absolute right-2 top-2"
            onClick={onRemove}
            aria-label="Remove image"
          >
            <X />
          </Button>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <div className="truncate font-medium">{file.name}</div>
          <div className="mt-1 text-sm text-muted-foreground">{formatFileSize(file.size)}</div>
        </div>
      </Card>
    </motion.div>
  );
}
