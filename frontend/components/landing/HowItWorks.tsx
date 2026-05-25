"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

import WireframeMesh from "./WireframeMesh";

const problemWords = ["Your", "sample", "has", "more", "fronds", "than", "you", "can", "count."];

const steps = [
  {
    number: "01",
    title: "Upload",
    lead: "Drop your petri dish photo",
    body: "Any top-down image of a duckweed water sample. JPEG, PNG, or TIFF up to 50MB.",
  },
  {
    number: "02",
    title: "Segment",
    lead: "Green isolation and watershed",
    body: "HSV masking isolates duckweed from water and debris. Watershed separates touching fronds.",
  },
  {
    number: "03",
    title: "Count",
    lead: "Hybrid classical and deep learning",
    body: "Convexity defect analysis estimates merged fronds. YOLOv8 provides instance-level detection.",
  },
  {
    number: "04",
    title: "Export",
    lead: "Publication-ready results",
    body: "Download your count, confidence score, and overlay image as JSON or CSV.",
  },
];

const stats = [
  ["< 3s", "INFERENCE"],
  ["±2", "TARGET ERROR"],
  ["50MB", "MAX SIZE"],
];

function ProblemStatement() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative grid min-h-screen overflow-hidden bg-black lg:grid-cols-[40%_60%]">
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-y-0 left-0 w-full origin-center -rotate-6 opacity-70">
          <WireframeMesh intensity={0.7} />
        </div>
      </div>
      <div ref={ref} className="flex items-center px-6 py-24 md:px-12">
        <div>
          <h2 className="max-w-[760px] font-display text-[clamp(36px,5vw,64px)] font-normal leading-[0.92] tracking-[-0.02em] text-white">
            {problemWords.map((word, index) => (
              <motion.span
                key={`${word}-${index}`}
                className="mr-[0.24em] inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : undefined}
                transition={{
                  delay: index * 0.06,
                  duration: 0.4,
                  ease: "easeOut",
                }}
              >
                {word}
                {index === 2 || index === 5 ? <br /> : null}
              </motion.span>
            ))}
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : undefined}
            transition={{ delay: 0.7, duration: 0.4, ease: "easeOut" }}
            className="mt-8 max-w-[520px] text-base leading-[1.6] text-[var(--text-dim)]"
          >
            Manual counting introduces human error, takes 20 minutes per sample, and
            cannot scale with your research.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section className="min-h-screen bg-black px-6 py-24 md:px-12">
      <div className="grid gap-16 lg:grid-cols-[45%_55%]">
        <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-96px)]">
          <h2 className="font-display text-[clamp(48px,7vw,96px)] font-normal leading-[0.92] tracking-[-0.02em] text-white">
            How
            <br />
            it
            <br />
            works<span className="text-[var(--accent)]">.</span>
          </h2>
        </div>
        <div>
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.04, duration: 0.2, ease: "easeOut" }}
              className="min-h-[200px] border-b border-[var(--border)] py-10"
            >
              <div className="number text-[11px] text-[var(--text-ghost)]">{step.number}</div>
              <h3 className="mt-5 font-display text-[28px] font-normal leading-none tracking-[-0.02em] text-white">
                {step.title}
              </h3>
              <p className="mt-4 max-w-[320px] text-[15px] leading-[1.6] text-[var(--text-dim)]">
                <span className="block text-white">{step.lead}</span>
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-x-0 bottom-0 h-[60%]">
        <WireframeMesh intensity={1} />
      </div>
      <div className="absolute left-1/2 top-[35%] z-10 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center px-6 text-center">
        <h2 className="font-display text-[clamp(48px,6vw,80px)] font-normal leading-[0.92] tracking-[-0.02em] text-white">
          Start counting
          <br />
          your fronds.
        </h2>
        <Link
          href="/upload"
          className="group mt-6 text-lg text-white underline-offset-4 transition-colors duration-200 hover:underline"
        >
          Begin Analysis{" "}
          <span className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-2">
            →
          </span>
        </Link>
        <div className="mt-12 flex flex-col gap-8 md:flex-row md:gap-16">
          {stats.map(([value, label]) => (
            <div key={label}>
              <div className="number text-4xl font-semibold leading-none text-[var(--accent)]">
                {value}
              </div>
              <div className="mt-3 text-xs uppercase tracking-[0.1em] text-[var(--text-ghost)]">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HowItWorks() {
  return (
    <>
      <ProblemStatement />
      <Workflow />
      <FinalCta />
    </>
  );
}
