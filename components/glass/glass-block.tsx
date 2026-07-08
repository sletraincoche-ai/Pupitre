import Link from "next/link";
import { GlassPanel, type GlassIntensity } from "@/components/glass/glass-panel";
import { cn } from "@/lib/utils";

export function GlassBlock({
  href,
  area,
  icon,
  title,
  subtitle,
  badge,
  intensity = "regular",
  className,
  children,
}: {
  href: string;
  area?: string;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: number;
  intensity?: GlassIntensity;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link href={href} data-area={area} className={cn("block h-full min-h-0 min-w-0", className)}>
      <GlassPanel
        intensity={intensity}
        className="group flex h-full min-w-0 flex-col gap-4 p-6 transition-transform duration-300 ease-out hover:-translate-y-0.5"
      >
        <div className="flex min-w-0 items-start justify-between gap-3">
          {icon && (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white">
              {icon}
            </span>
          )}
          {!!badge && (
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-destructive text-xs font-medium text-white">
              {badge}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold tracking-tight text-white">{title}</p>
          {subtitle && <p className="mt-0.5 text-sm text-white/65">{subtitle}</p>}
        </div>
        {children}
      </GlassPanel>
    </Link>
  );
}
