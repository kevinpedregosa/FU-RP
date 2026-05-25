type ConfidenceGaugeProps = {
  confidence: number;
  isLoading?: boolean;
};

export default function ConfidenceGauge({ confidence, isLoading = false }: ConfidenceGaugeProps) {
  const pct = isLoading ? 0 : Math.round(confidence * 100);
  const color =
    confidence >= 0.8
      ? "var(--text-primary)"
      : confidence >= 0.6
        ? "var(--amber-signal)"
        : "var(--red-signal)";

  return (
    <div>
      <div className="label mb-3 text-[10px]">CONFIDENCE</div>
      <div className="number text-5xl leading-none" style={{ color }}>
        {pct}%
      </div>
      <div className="mt-4 h-px w-full bg-white/10">
        <div className="h-px" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
