"use client";

import type { FrondCountResult } from "@/lib/types";

type FrondCountCardProps = {
  result: FrondCountResult;
  resultId: string;
  isLoading?: boolean;
  onCorrected?: (newCount: number) => void;
  modelVersion?: string;
};

export default function FrondCountCard({
  result,
  isLoading = false,
}: FrondCountCardProps) {
  if (isLoading) {
    return <div className="font-display text-[clamp(80px,12vw,160px)] text-[var(--text-ghost)]">...</div>;
  }

  return (
    <div>
      <div className="font-display text-[clamp(80px,12vw,160px)] font-normal leading-[0.82] tracking-[-0.02em] text-[var(--accent)]">
        {result.frond_count}
      </div>
      <div className="mt-3 text-base text-[var(--text-dim)]">fronds detected</div>
    </div>
  );
}
