"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
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
  ["<3s", "INFERENCE"],
  ["±2", "TARGET ERROR"],
  ["50MB", "MAX SIZE"],
];

const geometryShapes = ["triangle", "square", "circle", "rectangle"] as const;

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
          <h2 className="max-w-[760px] font-display text-[clamp(36px,5vw,64px)] font-normal leading-[0.92] tracking-[-0.02em] text-[var(--text-primary)]">
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
                {word === "count." ? (
                  <>
                    count<span className="text-[var(--accent)]">.</span>
                  </>
                ) : (
                  word
                )}
                {index === 2 || index === 5 ? <br /> : null}
              </motion.span>
            ))}
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : undefined}
            transition={{ delay: 0.7, duration: 0.4, ease: "easeOut" }}
            className="mt-10 max-w-[720px] text-[clamp(22px,2.1vw,32px)] leading-[1.45] text-[var(--text-dim)]"
          >
            Manual counting introduces human error, takes 20 minutes per sample, and
            cannot scale with your research.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : undefined}
            transition={{ delay: 0.9, duration: 0.4, ease: "easeOut" }}
            className="mt-12 max-w-[720px]"
          >
            <Image
              src="/duckweed-fronds.jpg"
              alt="Duckweed fronds floating on water"
              width={1024}
              height={768}
              className="h-[clamp(260px,28vw,420px)] w-full object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section className="min-h-screen bg-black px-6 py-24 md:px-12">
      <div className="grid gap-10 lg:grid-cols-[36%_64%]">
        <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-96px)]">
          <h2 className="font-display text-[clamp(48px,7vw,96px)] font-normal leading-[0.92] tracking-[-0.02em] text-[var(--text-primary)]">
            How
            <br />
            it
            <br />
            works<span className="text-[var(--accent)]">.</span>
          </h2>
          <div className="mt-16 grid w-[clamp(260px,28vw,420px)] grid-cols-2 gap-8">
            {geometryShapes.map((shape, index) => (
              <motion.svg
                key={shape}
                aria-hidden="true"
                viewBox="0 0 180 156"
                className="h-[clamp(110px,12vw,190px)] w-full overflow-visible text-[var(--accent)]"
                animate={{
                  rotate: [0, index % 2 === 0 ? 8 : -8, 0],
                  y: [0, index % 2 === 0 ? -10 : 10, 0],
                }}
                transition={{
                  delay: index * 0.2,
                  duration: 4.8 + index * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {shape === "triangle" ? (
                  <motion.polygon
                    points="90 6 174 150 6 150"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    opacity="0.85"
                    animate={{ pathLength: [0.35, 1, 0.35] }}
                    transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : null}
                {shape === "square" ? (
                  <motion.rect
                    x="28"
                    y="16"
                    width="124"
                    height="124"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.85"
                    animate={{ pathLength: [0.3, 1, 0.3] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : null}
                {shape === "circle" ? (
                  <motion.circle
                    cx="90"
                    cy="78"
                    r="62"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.85"
                    animate={{ pathLength: [0.25, 1, 0.25] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : null}
                {shape === "rectangle" ? (
                  <motion.rect
                    x="18"
                    y="42"
                    width="144"
                    height="72"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.85"
                    animate={{ pathLength: [0.35, 1, 0.35] }}
                    transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : null}
                <path
                  d="M90 18V138M30 78H150"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.22"
                />
                <circle cx="90" cy="78" r="4" fill="currentColor" opacity="0.7" />
              </motion.svg>
            ))}
          </div>
        </div>
        <div className="w-full">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.04, duration: 0.2, ease: "easeOut" }}
              className="min-h-[280px] border-b border-[var(--border)] py-14"
            >
              <div className="grid grid-cols-[96px_1fr] gap-10 xl:grid-cols-[120px_1fr] xl:gap-12">
                <div className="number pt-3 text-[clamp(40px,4vw,64px)] font-bold leading-none text-[var(--accent)]">
                  {step.number}
                </div>
                <div>
                  <h3 className="font-display text-[clamp(56px,6vw,88px)] font-normal leading-[0.92] tracking-[-0.02em] text-[var(--text-primary)]">
                    {step.title}
                  </h3>
                  <p className="mt-8 max-w-[1180px] text-[clamp(22px,1.8vw,30px)] leading-[1.35] text-[var(--text-dim)]">
                    <span className="block text-[clamp(26px,2.7vw,40px)] text-[var(--text-primary)]">
                      {step.lead}
                    </span>
                    {step.body}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative min-h-[72vh] overflow-hidden bg-black">
      <div className="absolute inset-x-0 bottom-0 h-[60%]">
        <WireframeMesh intensity={1} />
      </div>
      <div className="absolute left-1/2 top-[30%] z-10 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center px-6 text-center">
        <div className="flex flex-col gap-12 md:flex-row md:gap-24">
          {stats.map(([value, label]) => (
            <div key={label}>
              <div className="number text-[clamp(72px,8vw,132px)] font-semibold leading-none text-[var(--accent)]">
                {value}
              </div>
              <div className="mt-6 text-[clamp(18px,1.5vw,26px)] uppercase tracking-[0.1em] text-[var(--text-primary)]">
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
