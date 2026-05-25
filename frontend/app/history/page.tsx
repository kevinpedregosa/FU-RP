"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { API_BASE_URL } from "@/lib/constants";
import type { InferenceResponse } from "@/lib/types";

function displayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function confidenceColor(confidence: number) {
  if (confidence >= 0.8) return "var(--accent)";
  if (confidence >= 0.6) return "var(--amber-signal)";
  return "var(--red-signal)";
}

export default function HistoryPage() {
  const router = useRouter();
  const [results, setResults] = useState<InferenceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadHistory() {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/results/history?limit=20`);
        if (!response.ok) throw new Error("Could not load history");
        const data = (await response.json()) as InferenceResponse[];
        if (!ignore) setResults(data);
      } catch {
        if (!ignore) setResults([]);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadHistory();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="page-fade min-h-screen bg-black">
      <header className="px-6 pb-12 pt-24 md:px-12 md:pt-20">
        <div className="label mb-5 font-data">ANALYSIS LOG</div>
        <h1 className="font-display text-[72px] font-normal leading-[0.92] tracking-[-0.02em] text-white">
          Your results<span className="text-[var(--accent)]">.</span>
        </h1>
      </header>

      <div className="overflow-x-auto px-6 pb-20 md:px-12">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] text-left font-data text-[10px] uppercase tracking-[0.12em] text-[var(--text-ghost)]">
              <th className="py-4 pr-6 font-normal">DATE</th>
              <th className="py-4 pr-6 font-normal">FILE</th>
              <th className="py-4 pr-6 font-normal">FRONDS</th>
              <th className="py-4 pr-6 font-normal">CONFIDENCE</th>
              <th className="py-4 pr-6 font-normal">DURATION</th>
              <th className="py-4 font-normal" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className="h-16 border-b border-white/[0.06]">
                  <td colSpan={6} className="font-data text-xs text-[var(--text-ghost)]">
                    loading analysis {index + 1}
                  </td>
                </tr>
              ))
            ) : results.length === 0 ? (
              <tr>
                <td colSpan={6} className="pt-[200px] text-center">
                  <div className="font-display text-5xl leading-none tracking-[-0.02em] text-[var(--text-ghost)]">
                    No analyses yet.
                  </div>
                  <Link
                    href="/upload"
                    className="mt-6 inline-block text-sm text-[var(--accent)] underline-offset-4 hover:underline"
                  >
                    → Upload your first sample
                  </Link>
                </td>
              </tr>
            ) : (
              results.map((result, index) => {
                const confidence = Math.round(result.result.confidence * 100);
                const color = confidenceColor(result.result.confidence);
                return (
                  <motion.tr
                    key={result.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.15, ease: "easeOut" }}
                    className="group h-16 cursor-pointer border-b border-white/[0.06] transition-colors duration-200 hover:bg-white/[0.03]"
                    onClick={() => router.push(`/results/${result.id}`)}
                  >
                    <td className="number py-4 pr-6 text-xs text-[var(--text-ghost)]">
                      {displayDate(result.created_at)}
                    </td>
                    <td className="max-w-[280px] truncate py-4 pr-6 text-[13px] text-white">
                      {result.upload_id.slice(0, 12)}.jpg
                    </td>
                    <td className="number py-4 pr-6 text-xl font-semibold text-[var(--accent)]">
                      {result.result.frond_count}
                    </td>
                    <td className="py-4 pr-6">
                      <div className="flex items-center gap-3">
                        <span className="h-px w-10 bg-white/10">
                          <span
                            className="block h-px"
                            style={{ width: `${confidence}%`, background: color }}
                          />
                        </span>
                        <span className="number text-[11px] text-[var(--text-ghost)]">
                          {confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="number py-4 pr-6 text-[11px] text-[var(--text-ghost)]">
                      {result.processing_ms ? `${(result.processing_ms / 1000).toFixed(1)}s` : "—"}
                    </td>
                    <td className="py-4 text-right text-xl text-[var(--text-ghost)] transition-colors duration-200 group-hover:text-white">
                      →
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
