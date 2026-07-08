import Image from "next/image";
import Link from "next/link";
import { GlassPanel, type GlassIntensity } from "@/components/glass/glass-panel";
import { GlassSheen } from "@/components/glass/glass-sheen";
import { cn } from "@/lib/utils";

export function GlassBlock({
  href,
  area,
  icon,
  title,
  subtitle,
  badge,
  intensity = "regular",
  backgroundImage,
  backgroundImageAlt = "",
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
  backgroundImage?: string;
  backgroundImageAlt?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link href={href} data-area={area} className={cn("group block h-full min-h-0 min-w-0", className)}>
      <GlassPanel
        intensity={intensity}
        className="relative flex h-full min-w-0 flex-col gap-3 overflow-hidden p-6 transition-transform duration-300 ease-out hover:-translate-y-0.5"
      >
        <GlassSheen />

        {/* En-tête en flux normal — jamais recouvert par l'image, donc
            jamais besoin d'un voile de contraste par-dessus. */}
        <div className="relative z-10 flex min-w-0 shrink-0 items-start justify-between gap-3">
          {icon && (
            <span className="flex h-11 min-w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/10 px-2.5 text-white">
              {icon}
            </span>
          )}
          {!!badge && (
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-destructive text-xs font-medium text-white">
              {badge}
            </span>
          )}
        </div>
        <div className="relative z-10 min-w-0 shrink-0">
          <p className="text-lg font-semibold tracking-tight text-white">{title}</p>
          {subtitle && <p className="mt-0.5 text-sm text-white/70">{subtitle}</p>}
        </div>

        {/* L'image occupe l'espace restant, sous l'en-tête — jamais
            superposée au texte puisqu'elle vit dans une zone séparée du
            flux, pas en calque absolu plein bloc. */}
        {backgroundImage && (
          <div
            className="relative z-10 mt-1 min-h-[220px] flex-1"
            style={{
              maskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
            }}
          >
            <Image
              src={backgroundImage}
              alt={backgroundImageAlt}
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-contain object-bottom"
            />
          </div>
        )}

        {children && <div className="relative z-10 flex min-w-0 flex-1 flex-col">{children}</div>}
      </GlassPanel>
    </Link>
  );
}
