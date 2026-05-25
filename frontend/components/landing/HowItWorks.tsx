"use client";

import { motion } from "framer-motion";
import { BarChart3, Camera, Download, Microscope } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Capture",
    description:
      "Use a top-down photo with the cup centered, steady light, and visible green fronds.",
  },
  {
    icon: Microscope,
    title: "Segment",
    description:
      "The backend isolates saturated plant-green regions and filters likely reflections or film.",
  },
  {
    icon: BarChart3,
    title: "Estimate",
    description:
      "Counts are reported with confidence so questionable samples can be checked manually.",
  },
  {
    icon: Download,
    title: "Export Results",
    description:
      "Download your count, confidence score, and segmentation overlay as JSON or CSV.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="mt-3 text-muted-foreground">
            Four steps from upload to publication-ready count
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: index * 0.15, duration: 0.45 }}
              className="rounded-lg border bg-card p-6 shadow-sm"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <span className="font-mono text-sm text-muted-foreground">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
