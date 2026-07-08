import { cn } from "@/lib/utils";

export function FicheRow({
  numero,
  date,
  icon,
  titre,
  origine,
  active,
  onClick,
}: {
  numero?: string;
  date: string;
  icon: React.ReactNode;
  titre: string;
  origine?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-1 border-l-2 border-border px-3 py-2.5 text-left transition-colors",
        active ? "border-l-vine bg-vine/5" : "border-l-transparent hover:bg-muted/40"
      )}
    >
      <div className="flex items-center gap-2">
        {numero && (
          <span className="font-mono text-xs text-stone tabular-nums">N°{numero}</span>
        )}
        {icon}
        <span className="ml-auto font-mono text-xs text-stone tabular-nums whitespace-nowrap">
          {date}
        </span>
      </div>
      <p className="truncate text-sm font-medium text-ink">{titre}</p>
      {origine && <p className="truncate text-xs text-stone">{origine}</p>}
    </button>
  );
}
