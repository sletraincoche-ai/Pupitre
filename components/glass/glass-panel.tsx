import { cn } from "@/lib/utils";

// Système de verre réutilisable — teinte neutre (noir à opacité partielle,
// jamais teintée dans la palette de marque) volontairement assez sombre
// pour garantir un contraste AA avec du texte blanc quelle que soit la
// zone de la photo derrière. "light" reste pour de petits éléments
// (logo, recherche) ; "regular"/"strong" pour les blocs de contenu.
const intensites = {
  light: "bg-black/40 backdrop-blur-xl backdrop-saturate-150",
  regular: "bg-black/58 backdrop-blur-2xl backdrop-saturate-150",
  strong: "bg-black/70 backdrop-blur-2xl backdrop-saturate-150",
} as const;

export type GlassIntensity = keyof typeof intensites;

export function GlassPanel({
  intensity = "regular",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { intensity?: GlassIntensity }) {
  return (
    <div
      className={cn(
        "relative rounded-[28px] border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.28)]",
        intensites[intensity],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
