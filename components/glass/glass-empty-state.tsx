import type { LucideIcon } from "lucide-react";

export function GlassEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full border border-white/15 bg-white/10 text-gold">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-5 text-xl font-semibold tracking-tight text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/60">{description}</p>
    </div>
  );
}
