"use client";

import { useEffect, useState } from "react";

import { getDatasetStats } from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";
import type { DatasetStats } from "@/lib/types";

export default function AdminPage() {
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [architecture, setArchitecture] = useState("yolov8n-seg");
  const [epochs, setEpochs] = useState(100);

  useEffect(() => {
    let ignore = false;

    async function refreshStats() {
      setLoading(true);
      try {
        const next = await getDatasetStats();
        if (!ignore) setStats(next);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    refreshStats();
    return () => {
      ignore = true;
    };
  }, []);

  async function startRetraining(): Promise<void> {
    setRetraining(true);
    setMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/dataset/retrain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_architecture: architecture, epochs }),
      });
      const data = (await response.json()) as { status?: string; job_id?: string; detail?: string };
      if (!response.ok) throw new Error(data.detail ?? "Could not start training");
      setMessage(`Training started: ${data.job_id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not start training");
    } finally {
      setRetraining(false);
    }
  }

  const total = stats?.total ?? 0;
  const labeled = stats?.labeled ?? 0;
  const train = stats?.by_split.train ?? 0;
  const val = stats?.by_split.val ?? 0;
  const test = stats?.by_split.test ?? 0;
  const splitTotal = Math.max(1, total);

  return (
    <main className="page-fade min-h-screen bg-black px-6 pb-20 pt-24 md:px-12">
      <div className="label mb-5">DATASET ADMIN</div>
      <h1 className="font-display text-[clamp(56px,8vw,96px)] font-normal leading-[0.92] tracking-[-0.02em] text-white">
        Training
        <br />
        controls<span className="text-[var(--accent)]">.</span>
      </h1>

      <div className="mt-16 grid gap-12 lg:grid-cols-[58%_42%]">
        <section>
          <div className="label mb-6 text-[10px]">DATASET STATUS</div>
          <div className="grid gap-8 border-b border-[var(--border)] pb-10 md:grid-cols-3">
            {[
              ["TOTAL IMAGES", loading ? "..." : total],
              ["LABELED", loading ? "..." : labeled],
              ["SPLITS", 3],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="number text-4xl leading-none text-[var(--accent)]">{value}</div>
                <div className="mt-3 text-[11px] uppercase tracking-[0.12em] text-[var(--text-ghost)]">
                  {label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <div className="label mb-4 text-[10px]">SPLIT MIX</div>
            <div className="flex h-px w-full bg-white/10">
              {[
                [train, "var(--accent)"],
                [val, "var(--blue-signal)"],
                [test, "var(--amber-signal)"],
              ].map(([count, color], index) => (
                <span
                  key={index}
                  className="h-px"
                  style={{
                    width: `${(Number(count) / splitTotal) * 100}%`,
                    background: String(color),
                  }}
                />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 font-data text-[11px] text-[var(--text-ghost)]">
              <span>train {train}</span>
              <span>val {val}</span>
              <span>test {test}</span>
            </div>
          </div>
        </section>

        <section>
          <div className="label mb-6 text-[10px]">TRAINING CONSOLE</div>
          <div className="space-y-6">
            <label className="grid grid-cols-[120px_1fr] items-end gap-6 border-b border-white/10 pb-3 font-data text-[11px] text-[var(--text-ghost)]">
              ARCHITECTURE
              <select
                value={architecture}
                onChange={(event) => setArchitecture(event.target.value)}
                className="border-0 bg-transparent text-sm text-white outline-none"
              >
                <option value="yolov8n-seg">yolov8n-seg</option>
                <option value="yolov8s-seg">yolov8s-seg</option>
              </select>
            </label>
            <label className="grid grid-cols-[120px_1fr] items-end gap-6 border-b border-white/10 pb-3 font-data text-[11px] text-[var(--text-ghost)]">
              EPOCHS
              <input
                type="number"
                min={1}
                max={300}
                value={epochs}
                onChange={(event) => setEpochs(Number(event.target.value))}
                className="border-0 bg-transparent text-sm text-white outline-none"
              />
            </label>
          </div>

          <button
            type="button"
            className="group mt-10 text-sm text-white underline-offset-4 transition-colors duration-200 hover:underline disabled:text-[var(--text-ghost)]"
            disabled={total < 10 || retraining}
            onClick={startRetraining}
          >
            Initiate training{" "}
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </button>

          {message ? (
            <div className="number mt-6 text-xs text-[var(--text-ghost)]">{message}</div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
