"use client";

import Link from "next/link";
import { useState } from "react";

import ImageComparison from "@/components/results/ImageComparison";
import { correctCount, exportResultCsv, exportResultJson } from "@/lib/api";
import type { InferenceResponse } from "@/lib/types";

type ResultsDashboardProps = {
  result: InferenceResponse;
};

function confidenceColor(confidence: number) {
  if (confidence >= 0.8) return "text-[var(--text-primary)]";
  if (confidence >= 0.6) return "text-[var(--amber-signal)]";
  return "text-[var(--red-signal)]";
}

function confidenceBarColor(confidence: number) {
  if (confidence >= 0.8) return "var(--text-primary)";
  if (confidence >= 0.6) return "var(--amber-signal)";
  return "var(--red-signal)";
}

export default function ResultsDashboard({ result }: ResultsDashboardProps) {
  const [currentCount, setCurrentCount] = useState(result.result.frond_count);
  const [correction, setCorrection] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const confidencePct = Math.round(result.result.confidence * 100);

  async function submitCorrection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = Number.parseInt(correction, 10);
    if (!Number.isInteger(next) || next < 0) {
      setMessage("Enter a non-negative count.");
      return;
    }

    try {
      await correctCount(result.id, next);
      setCurrentCount(next);
      setMessage("Correction saved.");
      setCorrection("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Correction failed.");
    }
  }

  const rows = [
    ["CLASSICAL COUNT", result.result.classical_count ?? "—", false],
    ["YOLO COUNT", result.result.yolo_count ?? "—", result.result.yolo_count === 0],
    ["FINAL COUNT", currentCount, false],
  ] as const;

  return (
    <main className="page-fade min-h-screen bg-black">
      <section className="relative px-6 pb-16 pt-24 md:px-12">
        <div className="number text-[11px] text-[var(--text-ghost)]">
          Analysis / {result.id.slice(0, 8)}
        </div>
        <div className="mt-8 font-display text-[clamp(80px,12vw,160px)] font-normal leading-[0.82] tracking-[-0.02em] text-[var(--accent)]">
          {currentCount}
        </div>
        <div className="mt-4 text-base text-[var(--text-dim)]">fronds detected</div>
        <div className="number mt-4 text-xs text-[var(--text-ghost)]">
          {result.model_version} · {confidencePct}% confidence · {result.processing_ms ?? 0}ms
        </div>
        <div className="mt-8 flex gap-6 md:absolute md:right-12 md:top-1/2 md:mt-0 md:-translate-y-1/2 md:flex-col md:items-end">
          <Link
            href="/upload"
            className="text-sm text-[var(--text-dim)] transition-colors duration-200 hover:text-[var(--text-primary)]"
          >
            New Analysis →
          </Link>
          <Link
            href="/history"
            className="text-sm text-[var(--text-dim)] transition-colors duration-200 hover:text-[var(--text-primary)]"
          >
            ← Back
          </Link>
        </div>
      </section>

      <div className="border-t border-[var(--border)] px-6 py-12 md:px-12">
        <div className="grid gap-12 lg:grid-cols-[60%_40%]">
          <div>
            <ImageComparison
              uploadId={result.upload_id}
              originalUrl={result.original_url}
              overlayUrl={result.overlay_url}
            />
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <section>
              <div className="label mb-5 text-[10px]">SIGNAL BREAKDOWN</div>
              {rows.map(([label, value, ghost]) => (
                <div
                  key={label}
                  className="grid grid-cols-[1fr_auto] items-end border-b border-white/[0.06] py-5"
                >
                  <div className="number text-[11px] text-[var(--text-ghost)]">{label}</div>
                  <div
                    className={`number text-[32px] leading-none ${
                      label === "FINAL COUNT"
                        ? "text-[var(--accent)]"
                        : ghost
                          ? "text-[var(--text-ghost)]"
                          : "text-[var(--text-primary)]"
                    }`}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </section>

            <section className="mt-6">
              <div className="label mb-3 text-[10px]">CONFIDENCE</div>
              <div className={`number text-5xl leading-none ${confidenceColor(result.result.confidence)}`}>
                {confidencePct}%
              </div>
              <div className="mt-4 h-px w-full bg-white/10">
                <div
                  className="h-px"
                  style={{
                    width: `${confidencePct}%`,
                    background: confidenceBarColor(result.result.confidence),
                  }}
                />
              </div>
            </section>

            <section className="mt-6">
              <div className="label mb-3 text-[10px]">MANUAL CORRECTION</div>
              <form onSubmit={submitCorrection} className="flex items-end gap-3">
                <span className="number text-2xl text-[var(--text-primary)]">[</span>
                <input
                  value={correction}
                  onChange={(event) => setCorrection(event.target.value)}
                  className="number h-10 w-20 border-0 border-b border-white/30 bg-transparent text-center text-2xl text-[var(--text-primary)] outline-none"
                  inputMode="numeric"
                  aria-label="Manual frond count"
                />
                <span className="number text-2xl text-[var(--text-primary)]">]</span>
                <span className="text-sm text-[var(--text-dim)]">fronds</span>
                <button
                  type="submit"
                  className="text-xl text-[var(--text-dim)] transition-colors duration-200 hover:text-[var(--text-primary)]"
                  aria-label="Submit manual correction"
                >
                  →
                </button>
              </form>
              {message ? <div className="mt-3 text-xs text-[var(--text-ghost)]">{message}</div> : null}
            </section>

            <section className="mt-6">
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
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
