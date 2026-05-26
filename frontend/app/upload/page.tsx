"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import WireframeMesh from "@/components/landing/WireframeMesh";
import DropZone from "@/components/upload/DropZone";
import ImagePreview from "@/components/upload/ImagePreview";
import UploadProgress from "@/components/upload/UploadProgress";
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
    <main className="page-fade relative min-h-screen overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-60 lg:block">
        <WireframeMesh intensity={0.55} />
      </div>

      <section className="relative z-10 flex min-h-screen w-full items-center px-6 py-24 md:px-20 lg:w-1/2">
        <div className="w-full max-w-[560px]">
          <div className="label mb-5">SAMPLE ANALYSIS</div>
          <h1 className="font-display text-[64px] font-normal leading-[0.92] tracking-[-0.02em] text-[var(--text-primary)]">
            Upload your
            <br />
            sample
          </h1>

          <div className="mt-8">
            {selectedFile ? (
              <ImagePreview
                file={selectedFile}
                onRemove={() => !processing && setSelectedFile(null)}
              />
            ) : (
              <DropZone onFile={setSelectedFile} disabled={processing} />
            )}
          </div>

          <button
            type="button"
            className="relative mt-6 flex h-[52px] w-full items-center justify-center overflow-hidden bg-white text-sm font-medium text-black transition-colors duration-200 disabled:bg-white/10 disabled:text-[var(--text-ghost)]"
            disabled={!selectedFile || processing}
            onClick={() => selectedFile && uploadAndInfer(selectedFile)}
          >
            {processing ? (
              <span className="relative h-px w-3/4 overflow-hidden bg-white/20">
                <span className="progress-pulse absolute inset-y-0 left-0 w-1/2 bg-white" />
              </span>
            ) : (
              "Analyze Sample"
            )}
          </button>

          <UploadProgress state={state} />
        </div>
      </section>
    </main>
  );
}
