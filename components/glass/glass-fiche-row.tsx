import { cn } from "@/lib/utils";

export function GlassFicheRow({
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
        "flex w-full flex-col gap-1 rounded-xl border-l-2 px-3 py-2.5 text-left transition-colors",
        active ? "border-l-gold bg-white/10" : "border-l-transparent hover:bg-white/5"
      )}
    >
      <div className="flex items-center gap-2">
        {numero && <span className="font-mono text-xs text-white/50 tabular-nums">N°{numero}</span>}
        {icon}
        <span className="ml-auto font-mono text-xs whitespace-nowrap text-white/50 tabular-nums">
          {date}
        </span>
      </div>
      <p className="truncate text-sm font-medium text-white">{titre}</p>
      {origine && <p className="truncate text-xs text-white/55">{origine}</p>}
    </button>
  );
}
