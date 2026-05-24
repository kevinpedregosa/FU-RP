"use client";

import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatConfidence } from "@/lib/utils";

const examples = [
  { fronds: 4, confidence: 0.91, label: "Individual fronds", bgColor: "bg-green-50 dark:bg-green-950" },
  { fronds: 7, confidence: 0.84, label: "Mixed cluster", bgColor: "bg-emerald-50 dark:bg-emerald-950" },
  { fronds: 12, confidence: 0.78, label: "Dense sample", bgColor: "bg-teal-50 dark:bg-teal-950" },
];

export default function ExampleGallery() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-10 text-center text-3xl font-bold">Example Results</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {examples.map((example) => (
            <motion.div key={example.label} whileHover={{ scale: 1.02 }}>
              <Card className="overflow-hidden rounded-xl">
                <div
                  className={cn(
                    "flex aspect-video items-center justify-center",
                    example.bgColor
                  )}
                >
                  <Leaf className="size-16 text-primary" />
                </div>
                <CardContent className="flex flex-col gap-3 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-4xl font-bold">{example.fronds}</div>
                      <div className="text-sm text-muted-foreground">fronds</div>
                    </div>
                    <Badge>{formatConfidence(example.confidence)}</Badge>
                  </div>
                  <div className="text-sm font-medium">{example.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
