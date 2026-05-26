"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import WireframeMesh from "./WireframeMesh";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      <WireframeMesh intensity={1} />

      <div className="absolute left-1/2 top-20 z-10 -translate-x-1/2 text-center">
        <div className="flex items-center justify-center gap-5 whitespace-nowrap">
          <Image
            src="/fusion-logo.png"
            alt="Fusion logo"
            width={92}
            height={92}
            priority
            className="h-[clamp(56px,6vw,92px)] w-[clamp(56px,6vw,92px)] object-contain"
          />
          <div className="font-display text-[clamp(44px,5.6vw,80px)] font-bold leading-[0.92] tracking-[-0.02em] text-white">
            Fusion Research Project
          </div>
        </div>
        <div className="mt-5 whitespace-nowrap text-[clamp(15px,1.45vw,22px)] uppercase tracking-[0.12em] text-white">
          Full-Stack Computer Vision System
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 z-10 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center px-6 text-center">
        <Link
          href="/upload"
          className="group text-[clamp(28px,3.4vw,58px)] leading-tight text-[var(--text-primary)] underline-offset-4 transition-colors duration-200 hover:underline"
        >
          Begin Bioimage Analysis{" "}
          <span className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-2">
            →
          </span>
        </Link>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
        <div className="text-[18px] text-[var(--text-ghost)]">scroll</div>
        <div className="h-10 w-px bg-white/20">
          <div className="scroll-line h-10 w-px bg-white" />
        </div>
      </div>
    </section>
  );
}
