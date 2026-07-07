import Link from "next/link";
import { Mail } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { InstagramBadge, FacebookBadge } from "@/components/studio/brand-icons";
import type { Fiche } from "@/lib/fiches";
import { cn } from "@/lib/utils";

const logoParCanal: Record<Fiche["canal"], React.ReactNode> = {
  Instagram: <InstagramBadge className="size-5 shrink-0" />,
  Facebook: <FacebookBadge className="size-5 shrink-0" />,
  Email: (
    <span className="flex size-5 shrink-0 items-center justify-center rounded bg-ink/5 text-ink">
      <Mail className="size-3" />
    </span>
  ),
  "Avis Google": (
    <span className="flex size-5 shrink-0 items-center justify-center rounded bg-white ring-1 ring-border">
      <FcGoogle className="size-3.5" />
    </span>
  ),
};

const statutStyles: Record<Fiche["statut"], string> = {
  "En attente": "text-gold",
  Publiée: "text-vine",
  Envoyée: "text-vine",
};

export function FicheTable({ fiches }: { fiches: Fiche[] }) {
  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs tracking-wide text-stone uppercase">
            <th className="px-4 py-2.5 font-medium">N°</th>
            <th className="px-4 py-2.5 font-medium">Date</th>
            <th className="px-4 py-2.5 font-medium">Canal</th>
            <th className="px-4 py-2.5 font-medium">Statut</th>
            <th className="px-4 py-2.5 font-medium">Aperçu</th>
            <th className="px-4 py-2.5 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {fiches.map((fiche) => (
            <tr
              key={`${fiche.numero}-${fiche.canal}`}
              className="border-b border-border/60 last:border-b-0"
            >
              <td className="px-4 py-2.5 font-mono text-stone tabular-nums">N°{fiche.numero}</td>
              <td className="px-4 py-2.5 font-mono text-ink tabular-nums whitespace-nowrap">
                {fiche.date}
              </td>
              <td className="px-4 py-2.5">
                <span className="flex items-center gap-2 whitespace-nowrap text-ink">
                  {logoParCanal[fiche.canal]}
                  {fiche.canal}
                </span>
              </td>
              <td className={cn("px-4 py-2.5 font-medium whitespace-nowrap", statutStyles[fiche.statut])}>
                {fiche.statut}
              </td>
              <td className="max-w-xs truncate px-4 py-2.5 text-stone" title={fiche.origine}>
                {fiche.apercu}
              </td>
              <td className="px-4 py-2.5 text-right">
                <Link
                  href={fiche.lien}
                  className="rounded-[3px] border border-ink/25 px-3 py-1 text-xs font-medium whitespace-nowrap text-ink hover:bg-ink/5"
                >
                  Ouvrir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
