export function QuizProgress({ total, courant }: { total: number; courant: number }) {
  const pourcentage = ((courant + 1) / total) * 100;

  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 font-mono text-xs text-stone tabular-nums">
        N° {String(courant + 1).padStart(2, "0")} / {total}
      </span>
      <div className="h-px flex-1 bg-border">
        <div className="h-px bg-vine transition-all duration-300" style={{ width: `${pourcentage}%` }} />
      </div>
    </div>
  );
}
