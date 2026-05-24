"use client";

import { Download, FileJson, FileText } from "lucide-react";

import { exportResultCsv, exportResultJson } from "@/lib/api";
import type { InferenceResponse } from "@/lib/types";
import { formatDate, formatProcessingTime } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type ExportPanelProps = {
  result: InferenceResponse;
};

export default function ExportPanel({ result }: ExportPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="size-5 text-primary" />
          Export Results
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Result ID</dt>
            <dd className="font-mono">{result.id.slice(0, 12)}...</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Model</dt>
            <dd>{result.model_version}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Processing time</dt>
            <dd>{formatProcessingTime(result.processing_ms)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Date</dt>
            <dd>{formatDate(result.created_at)}</dd>
          </div>
        </dl>
        <Separator />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button variant="outline" className="w-full" onClick={() => exportResultJson(result)}>
            <FileJson data-icon="inline-start" />
            Download JSON
          </Button>
          <Button variant="outline" className="w-full" onClick={() => exportResultCsv(result)}>
            <FileText data-icon="inline-start" />
            Download CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
