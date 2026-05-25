export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--border-dim)] bg-[var(--ink)] px-6 py-4">
      <div className="flex flex-col justify-between gap-2 font-data text-[10px] uppercase tracking-[0.12em] text-[var(--data-ghost)] md:flex-row">
        <span>FROND COUNTER / RESEARCH TOOL</span>
        <span className="number">{year} / AQUATIC BIOLOGY IMAGE ANALYSIS</span>
      </div>
    </footer>
  );
}
