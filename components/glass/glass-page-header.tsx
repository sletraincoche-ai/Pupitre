import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GlassPanel } from "@/components/glass/glass-panel";

// Le texte du titre ne peut pas flotter nu sur la photo de fond — mesuré
// à 1.45:1 de contraste sur les zones claires, largement sous l'AA.
// Enveloppé dans un panneau de verre, comme tout autre bloc ; "strong"
// pour tenir la marge sur le sous-titre en corps de texte normal.
// Format compact sur une seule ligne pour laisser un maximum de hauteur
// aux colonnes en mode plein écran.
export function GlassPageHeader({
  title,
  subtitle,
  backHref = "/dashboard/studio",
  action,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: React.ReactNode;
}) {
  return (
    <GlassPanel intensity="strong" className="mb-4 shrink-0 px-4 py-3">
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          aria-label="Retour au Studio"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/85 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold tracking-tight text-white">{title}</p>
          {subtitle && <p className="truncate text-sm text-white/70">{subtitle}</p>}
        </div>
        {action}
      </div>
    </GlassPanel>
  );
}
