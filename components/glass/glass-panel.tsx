import { cn } from "@/lib/utils";

// Système de verre réutilisable — teinte neutre (noir à opacité partielle,
// jamais teintée dans la palette de marque). Volontairement plus légère
// que la première version : le fond doit rester bien visible en
// transparence. Le contraste AA du texte n'est plus porté par l'opacité
// globale du bloc mais par un voile ciblé (voir GlassTextScrim), plus
// fin et localisé juste derrière le texte.
const intensites = {
  light: "bg-black/22 backdrop-blur-lg backdrop-saturate-150",
  regular: "bg-black/30 backdrop-blur-xl backdrop-saturate-150",
  strong: "bg-black/42 backdrop-blur-xl backdrop-saturate-150",
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
