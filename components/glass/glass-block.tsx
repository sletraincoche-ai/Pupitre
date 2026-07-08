import Image from "next/image";
import Link from "next/link";
import { GlassPanel, type GlassIntensity } from "@/components/glass/glass-panel";
import { GlassSheen } from "@/components/glass/glass-sheen";
import { cn } from "@/lib/utils";

// Voile ciblé : pas l'opacité de tout le bloc, juste un dégradé derrière
// la zone où vit le texte (icône + titre), pour garantir le contraste AA
// même quand le bloc est très transparent ou qu'une image de fond
// chargée passe derrière.
export function GlassTextScrim({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-0 h-[76%] rounded-t-[28px] bg-gradient-to-b from-black/85 via-black/55 to-transparent",
        className
      )}
    />
  );
}

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
  backgroundImagePosition = "center",
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
  backgroundImagePosition?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link href={href} data-area={area} className={cn("group block h-full min-h-0 min-w-0", className)}>
      <GlassPanel
        intensity={intensity}
        className="relative flex h-full min-w-0 flex-col gap-4 overflow-hidden p-6 transition-transform duration-300 ease-out hover:-translate-y-0.5"
      >
        {backgroundImage && (
          <div
            className="absolute inset-0 z-0"
            style={{
              maskImage: "radial-gradient(ellipse 85% 75% at 50% 66%, black 46%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 50% 66%, black 46%, transparent 100%)",
            }}
          >
            <Image
              src={backgroundImage}
              alt={backgroundImageAlt}
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-contain"
              style={{ objectPosition: backgroundImagePosition }}
            />
          </div>
        )}

        <GlassTextScrim />
        <GlassSheen />

        <div className="relative z-10 flex min-w-0 items-start justify-between gap-3">
          {icon && (
            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/10 text-white">
              {icon}
            </span>
          )}
          {!!badge && (
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-destructive text-xs font-medium text-white">
              {badge}
            </span>
          )}
        </div>
        <div className="relative z-10 min-w-0">
          <p className="text-lg font-semibold tracking-tight text-white">{title}</p>
          {subtitle && <p className="mt-0.5 text-sm text-white/70">{subtitle}</p>}
        </div>
        {children && <div className="relative z-10 flex min-w-0 flex-1 flex-col">{children}</div>}
      </GlassPanel>
    </Link>
  );
}
