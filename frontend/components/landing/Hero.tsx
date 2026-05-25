"use client";

import { motion } from "framer-motion";
import { ArrowRight, FlaskConical, Leaf } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const stats = [
  { value: "Overlay", label: "Review every detected region" },
  { value: "Confidence", label: "Low-certainty results are flagged" },
  { value: "Export", label: "Save results for lab notes" },
];

export default function Hero() {
  return (
    <section className="scientific-grid w-full py-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4"
      >
        <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium text-primary shadow-sm">
          <Leaf className="size-4" />
          Duckweed image analysis
        </div>
        <div className="flex flex-col gap-5">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Duckweed Frond Counter
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Estimate frond counts from top-down sample photos, inspect the segmentation
            overlay, and keep uncertain runs out of your final dataset.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/upload">
            <Button size="lg">
              Start Counting
              <ArrowRight data-icon="inline-end" />
            </Button>
          </Link>
          <Link href="#examples">
          <Button variant="outline" size="lg">
            <FlaskConical data-icon="inline-start" />
            View Example Results
          </Button>
          </Link>
        </div>
        <div className="grid w-full grid-cols-1 gap-4 pt-8 md:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              className="rounded-lg border bg-card/80 p-6 shadow-sm backdrop-blur"
            >
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
