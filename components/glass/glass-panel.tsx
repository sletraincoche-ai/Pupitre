import { cn } from "@/lib/utils";

// Système de verre réutilisable — teinte neutre (noir à opacité partielle,
// jamais teintée dans la palette de marque). Pas de voile superposé pour
// le contraste du texte : uniquement ce verre translucide. "strong" sert
// pour les blocs dont le texte tombe sur une zone claire de la photo de
// fond (choisi au cas par cas, pas systématique).
const intensites = {
  light: "bg-black/22 backdrop-blur-lg backdrop-saturate-150",
  regular: "bg-black/30 backdrop-blur-xl backdrop-saturate-150",
  strong: "bg-black/55 backdrop-blur-xl backdrop-saturate-150",
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
