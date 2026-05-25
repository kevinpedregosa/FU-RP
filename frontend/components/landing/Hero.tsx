"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import WireframeMesh from "./WireframeMesh";

const words = ["Duckweed", "Frond", "Counter"];

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      <WireframeMesh intensity={1} />

      <div className="absolute left-1/2 top-20 z-10 -translate-x-1/2 text-center">
        <div className="whitespace-nowrap font-display text-[clamp(40px,5vw,72px)] font-normal leading-[0.92] tracking-[-0.02em] text-white">
          Fusion Research Project
        </div>
        <div className="mt-3 whitespace-nowrap text-[11px] uppercase tracking-[0.12em] text-[var(--text-ghost)]">
          full-stack computer vision system
        </div>
      </div>

      <Link
        href="/upload"
        className="group absolute right-6 top-32 z-10 max-w-[160px] text-[15px] leading-tight text-white underline-offset-4 transition-colors duration-200 hover:underline md:right-12 md:top-20"
      >
        Begin Analysis{" "}
        <span className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1">
          →
        </span>
      </Link>

      <div className="absolute bottom-20 left-6 z-10 md:left-12">
        <h1 className="font-display text-[clamp(56px,7vw,88px)] font-normal leading-[0.92] tracking-[-0.02em] text-white">
          {words.map((word, index) => (
            <motion.span
              key={word}
              className="block overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.08,
                duration: 0.4,
                ease: "easeOut",
              }}
            >
              {word}
              {index === words.length - 1 ? <span className="text-[var(--accent)]">.</span> : null}
            </motion.span>
          ))}
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
        className="absolute bottom-20 right-6 z-10 max-w-[280px] text-right font-display text-[clamp(28px,3.5vw,44px)] font-normal leading-[0.96] tracking-[-0.02em] text-[var(--text-dim)] md:right-12"
      >
        Upload a sample.
        <br />
        Get a count.
      </motion.div>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
        <div className="text-[10px] text-[var(--text-ghost)]">scroll</div>
        <div className="h-6 w-px bg-white/20">
          <div className="scroll-line h-6 w-px bg-white" />
        </div>
      </div>
    </section>
  );
}
