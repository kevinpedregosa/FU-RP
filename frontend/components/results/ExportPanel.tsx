"use client";

import { exportResultCsv, exportResultJson } from "@/lib/api";
import type { InferenceResponse } from "@/lib/types";

type ExportPanelProps = {
  result: InferenceResponse;
};

export default function ExportPanel({ result }: ExportPanelProps) {
  return (
    <div>
      <div className="label mb-3 text-[10px]">EXPORT</div>
      <div className="flex flex-col items-start gap-3">
        <button
          type="button"
          className="group text-sm text-[var(--text-dim)] transition-colors duration-200 hover:text-[var(--text-primary)]"
          onClick={() => exportResultJson(result)}
        >
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>{" "}
          Download JSON
        </button>
        <button
          type="button"
          className="group text-sm text-[var(--text-dim)] transition-colors duration-200 hover:text-[var(--text-primary)]"
          onClick={() => exportResultCsv(result)}
        >
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>{" "}
          Download CSV
        </button>
      </div>
    </div>
  );
}
