export function StepPills({ total, courant }: { total: number; courant: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          {i === courant ? (
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold text-[11px] font-medium text-white">
              {i + 1}
            </span>
          ) : (
            <span className="text-[13px] text-stone/70">{i + 1}</span>
          )}
          {i < total - 1 && <span className="h-px w-4 bg-border" />}
        </div>
      ))}
    </div>
  );
}
