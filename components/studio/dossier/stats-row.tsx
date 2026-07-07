import { cn } from "@/lib/utils";

export function StatsRow({
  items,
}: {
  items: { label: string; value: string; accent?: boolean }[];
}) {
  return (
    <div className="grid grid-cols-2 divide-x divide-y divide-border border border-border sm:grid-cols-4 sm:divide-y-0">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1 px-5 py-4">
          <span className="text-xs tracking-wide text-stone uppercase">{item.label}</span>
          <span
            className={cn(
              "font-mono text-xl tabular-nums",
              item.accent ? "text-gold" : "text-ink"
            )}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
