import { GlassPanel, type GlassIntensity } from "@/components/glass/glass-panel";
import { cn } from "@/lib/utils";

// Grille à 3 colonnes verticales alignées — même point de départ, même
// espacement, chaque colonne s'étire à la hauteur de la plus grande
// (comportement par défaut de la grille CSS, align-items: stretch).
export function GlassThreeColumns({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[300px_1fr_360px]", className)}>
      {children}
    </div>
  );
}

export function GlassColumnPanel({
  label,
  intensity = "strong",
  bare = false,
  bodyClassName,
  className,
  children,
}: {
  label?: string;
  intensity?: GlassIntensity;
  bare?: boolean;
  bodyClassName?: string;
  className?: string;
  children: React.ReactNode;
}) {
  // Colonne "nue" : aucun panneau de verre ni bordure — l'asset flotte
  // directement sur le fond de vignoble (utilisé pour la colonne Aperçu).
  if (bare) {
    return (
      <div className={cn("flex h-full min-h-0 flex-col overflow-y-auto", className)}>
        <div className={cn("flex min-h-0 flex-1 items-center justify-center", bodyClassName)}>{children}</div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <GlassPanel intensity={intensity} className="flex h-full min-h-0 flex-col overflow-y-auto p-5">
        {label && (
          <p className="mb-3 shrink-0 text-xs font-medium tracking-wide text-white/60 uppercase">{label}</p>
        )}
        <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
      </GlassPanel>
    </div>
  );
}
