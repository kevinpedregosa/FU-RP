"use client";

import type { UploadState } from "@/lib/types";

type UploadProgressProps = {
  state: UploadState;
};

export default function UploadProgress({ state }: UploadProgressProps) {
  if (state.status === "idle") return null;

  const uploadingDone = state.progress >= 50;
  const segmenting = state.status === "uploading";
  const inferring = state.status === "inferring";
  const done = state.status === "done";
  const error = state.status === "error";

  const lines = error
    ? [{ text: "→ analysis failed...", status: state.error ?? "error", active: false }]
    : [
        { text: "→ uploading file...", status: uploadingDone ? "done" : "...", active: !uploadingDone },
        { text: "→ preprocessing image...", status: uploadingDone ? "done" : "", active: false },
        {
          text: "→ running segmentation...",
          status: inferring || done ? "done" : "...",
          active: segmenting,
        },
        { text: "→ counting fronds...", status: done ? "done" : inferring ? "" : "", active: inferring },
      ];

  return (
    <div className="mt-6 space-y-2 font-data text-xs">
      {lines.map((line, index) => (
        <div
          key={`${line.text}-${index}`}
          className="grid grid-cols-[1fr_auto] gap-6 text-[var(--text-ghost)] opacity-0"
          style={{ animation: `pageFade 150ms ease-out ${index * 60}ms forwards` }}
        >
          <span>{line.text}</span>
          <span className={error ? "text-[var(--red-signal)]" : "text-[var(--accent)]"}>
            {line.status}
            {line.active ? <span className="cursor-blink text-white">█</span> : null}
          </span>
        </div>
      ))}
    </div>
  );
}
