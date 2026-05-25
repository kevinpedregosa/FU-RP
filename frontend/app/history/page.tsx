"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, Clock, Database, Leaf } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/lib/constants";
import { formatConfidence, formatDate, getConfidenceColor } from "@/lib/utils";
import type { InferenceResponse } from "@/lib/types";

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
        if (!response.ok) {
          throw new Error("Could not load history");
        }
        const data = (await response.json()) as InferenceResponse[];
        if (!ignore) {
          setResults(data);
        }
      } catch {
        if (!ignore) {
          setResults([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Analysis History</h1>
        <p className="text-muted-foreground">Your recent duckweed counting runs</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="flex items-center gap-4 p-4">
                <Skeleton className="size-16 rounded-md" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-36" />
                </div>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
          <Database className="size-12 text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">No analyses yet</h2>
            <p className="text-sm text-muted-foreground">
              Completed counting runs will appear here.
            </p>
          </div>
          <Button onClick={() => router.push("/upload")}>Start Counting</Button>
        </div>
      ) : (
        <motion.div className="flex flex-col gap-3">
          {results.map((result, index) => {
            const imageSrc = result.original_url ? `${API_BASE_URL}${result.original_url}` : null;
            const title = result.upload_id.slice(0, 12);

            return (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => router.push(`/results/${result.id}`)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={`Original upload ${title}`}
                          width={64}
                          height={64}
                          className="size-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <Leaf className="size-7 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">Upload {title}...</div>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="size-4" />
                        {formatDate(result.created_at)}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {result.result.frond_count}
                        </div>
                        <Badge
                          variant="secondary"
                          className={getConfidenceColor(result.result.confidence)}
                        >
                          {formatConfidence(result.result.confidence)}
                        </Badge>
                      </div>
                      <ChevronRight className="size-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </main>
  );
}
