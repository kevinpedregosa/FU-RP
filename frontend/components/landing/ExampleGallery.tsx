"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatConfidence } from "@/lib/utils";

const examples = [
  {
    fronds: 3,
    confidence: 0.52,
    label: "Source photo",
    image: "/examples/duckweed-sample.png",
    note: "Clear sample with three separated green regions.",
  },
  {
    fronds: 3,
    confidence: 0.52,
    label: "Overlay review",
    image: "/examples/duckweed-overlay.png",
    note: "Detected regions are drawn directly on the processed image.",
  },
  {
    fronds: 0,
    confidence: 0,
    label: "Manual check",
    image: "/examples/duckweed-sample.png",
    note: "Low-confidence results should be verified before export.",
  },
];

export default function ExampleGallery() {
  return (
    <section id="examples" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">Example Results</h2>
          <p className="mt-3 text-muted-foreground">
            The public app favors transparent estimates over inflated certainty.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {examples.map((example) => (
            <motion.div key={example.label} whileHover={{ scale: 1.02 }}>
              <Card className="overflow-hidden rounded-lg">
                <div className="relative aspect-video bg-muted">
                  <Image
                    src={example.image}
                    alt={`${example.label} duckweed example`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
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
                  <p className="text-sm leading-6 text-muted-foreground">{example.note}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
