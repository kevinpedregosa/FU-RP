"use client";

import { motion } from "framer-motion";
import { BarChart3, Database, RefreshCw, Upload } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { API_BASE_URL } from "@/lib/constants";
import { getDatasetStats } from "@/lib/api";
import type { DatasetStats } from "@/lib/types";

export default function AdminPage() {
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [architecture, setArchitecture] = useState("yolov8n-seg");
  const [epochs, setEpochs] = useState(50);

  async function refreshStats(): Promise<void> {
    setLoading(true);
    try {
      setStats(await getDatasetStats());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshStats();
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
      if (!response.ok) {
        throw new Error(data.detail ?? "Could not start training");
      }
      setMessage(`Training started: ${data.job_id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not start training");
    } finally {
      setRetraining(false);
    }
  }

  async function uploadDatasetImage(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setMessage(null);
    const response = await fetch(`${API_BASE_URL}/api/dataset/upload`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const error = (await response.json()) as { detail?: string };
      setMessage(error.detail ?? "Dataset upload failed");
      return;
    }
    form.reset();
    setMessage("Dataset image uploaded");
    await refreshStats();
  }

  const total = stats?.total ?? 0;
  const labeled = stats?.labeled ?? 0;
  const splitTotal = Math.max(1, total);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12"
    >
      <div>
        <div className="flex items-center gap-3">
          <Database className="size-8 text-primary" />
          <h1 className="text-4xl font-bold">Dataset Manager</h1>
        </div>
        <p className="mt-3 text-muted-foreground">
          Manage training data and trigger model retraining
        </p>
      </div>
      {message ? (
        <div className="rounded-xl border bg-card p-4 text-sm font-medium">{message}</div>
      ) : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total images</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-bold">{loading ? "…" : total}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Labeled images</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-bold">{loading ? "…" : labeled}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" />
              Split breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(["train", "val", "test"] as const).map((split) => {
              const count = stats?.by_split[split] ?? 0;
              return (
                <div key={split} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{split}</span>
                    <span>{count}</span>
                  </div>
                  <Progress value={(count / splitTotal) * 100} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="size-5 text-primary" />
            Trigger Retraining
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">Requires at least 10 labeled images</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Architecture select
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={architecture}
                onChange={(event) => setArchitecture(event.target.value)}
              >
                <option value="yolov8n-seg">yolov8n-seg</option>
                <option value="yolov8s-seg">yolov8s-seg</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Epochs input
              <input
                type="number"
                min={1}
                max={300}
                value={epochs}
                onChange={(event) => setEpochs(Number(event.target.value))}
                className="h-10 rounded-md border bg-background px-3 text-sm"
              />
            </label>
          </div>
          <Button disabled={(stats?.total ?? 0) < 10 || retraining} onClick={startRetraining}>
            {retraining ? (
              <RefreshCw data-icon="inline-start" className="animate-spin" />
            ) : (
              <RefreshCw data-icon="inline-start" />
            )}
            Start Training
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="size-5 text-primary" />
            Upload Labeled Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={uploadDatasetImage}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium">
                Image file
                <input name="image" type="file" accept="image/*" required />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Optional Label file (.txt)
                <input name="label" type="file" accept=".txt" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                True count number
                <input name="true_count" type="number" className="h-10 rounded-md border bg-background px-3 text-sm" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Split
                <select name="split" defaultValue="train" className="h-10 rounded-md border bg-background px-3 text-sm">
                  <option value="train">train</option>
                  <option value="val">val</option>
                  <option value="test">test</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
                Annotated by
                <input name="annotated_by" type="text" className="h-10 rounded-md border bg-background px-3 text-sm" />
              </label>
            </div>
            <input name="annotation_type" type="hidden" value="yolo_seg" />
            <Button type="submit">
              <Upload data-icon="inline-start" />
              Upload to Dataset
            </Button>
            <Badge variant="secondary" className="w-fit">
              Active dataset count: {total}
            </Badge>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
