"use client";

import { useEffect, useRef } from "react";

type WireframeMeshProps = {
  intensity?: number;
  className?: string;
};

const COLS = 60;
const ROWS = 25;

export default function WireframeMesh({ intensity = 1, className }: WireframeMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollRef = useRef(0);

  useEffect(() => {
    function onScroll() {
      scrollRef.current = window.scrollY;
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const node = canvas;

    const context = node.getContext("2d");
    if (!context) return;
    const ctx = context;

    let width = 0;
    let height = 0;
    let raf = 0;
    let time = 0;

    function resize() {
      const rect = node.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      node.width = Math.max(1, Math.floor(width * dpr));
      node.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function point(col: number, row: number, amplitude: number) {
      const xPad = width * 0.06;
      const x = xPad + (col / (COLS - 1)) * (width - xPad * 2);
      const rowRatio = row / (ROWS - 1);
      const horizon = height * 0.37;
      const floor = height * 0.93;
      const perspective = rowRatio * rowRatio;
      const yBase = horizon + perspective * (floor - horizon);
      const waveX = col * 0.3;
      const waveSlow = col * 0.1;
      const rowPhase = row * 0.34;
      const wave =
        Math.sin(waveX + time + rowPhase) *
        Math.cos(waveSlow - time * 0.7 + rowPhase) *
        amplitude;
      const y = yBase - wave * (0.25 + rowRatio * 0.9);
      return { x, y, wave, rowRatio };
    }

    function draw() {
      time += 0.008;
      const scrollBoost = 1 + scrollRef.current * 0.001;
      const amplitude = (80 + Math.sin(time * 0.3) * 40) * intensity * scrollBoost;

      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      ctx.globalCompositeOperation = "lighter";

      for (let row = 0; row < ROWS; row += 1) {
        const rowRatio = row / (ROWS - 1);
        const topGreen = 1 - rowRatio;
        for (let col = 0; col < COLS - 1; col += 1) {
          const a = point(col, row, amplitude);
          const b = point(col + 1, row, amplitude);
          const centerA = 1 - Math.abs(col / (COLS - 1) - 0.5) * 2;
          const centerB = 1 - Math.abs((col + 1) / (COLS - 1) - 0.5) * 2;
          const centerFade = Math.max(0, Math.min(1, (centerA + centerB) / 2));
          const waveIntensity = Math.min(1, Math.abs(a.wave) / Math.max(1, amplitude));
          const opacity =
            (0.1 + centerFade * 0.48 + waveIntensity * 0.12) *
            (0.35 + rowRatio * 0.65);
          const greenMix = Math.max(0, Math.min(1, topGreen * 0.7 + waveIntensity * 0.25));
          const white = Math.round(255 * (1 - greenMix) + 62 * greenMix);
          const green = Math.round(255 * (1 - greenMix) + 207 * greenMix);
          const blue = Math.round(255 * (1 - greenMix) + 142 * greenMix);

          ctx.strokeStyle = `rgba(${white}, ${green}, ${blue}, ${Math.min(0.6, opacity)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      ctx.globalCompositeOperation = "source-over";
      raf = window.requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "pointer-events-none absolute inset-0 z-0 h-full w-full"}
      aria-hidden="true"
    />
  );
}
