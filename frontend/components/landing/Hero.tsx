"use client";

import { motion } from "framer-motion";
import { ArrowRight, FlaskConical, Leaf } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const stats = [
  { value: "< 3s", label: "Inference time" },
  { value: "4K", label: "Max image size" },
  { value: "Hybrid CV", label: "Classical + Deep Learning" },
];

export default function Hero() {
  return (
    <section className="scientific-grid w-full py-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4"
      >
        <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium text-primary shadow-sm">
          <Leaf className="size-4" />
          Computer Vision + Deep Learning
        </div>
        <div className="flex flex-col gap-5">
          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
            Count Duckweed Fronds
            <br />
            <span className="text-primary">Automatically</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Upload a water sample photo and get an accurate frond count in under 3
            seconds using hybrid computer vision and YOLOv8 segmentation.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/upload">
            <Button size="lg">
              Start Counting
              <ArrowRight data-icon="inline-end" />
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            <FlaskConical data-icon="inline-start" />
            View Example Results
          </Button>
        </div>
        <div className="grid w-full grid-cols-1 gap-4 pt-8 md:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              className="rounded-xl border bg-card/80 p-6 shadow-sm backdrop-blur"
            >
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
