"use client";

import { Star } from "lucide-react";
import { GlassFicheRow } from "@/components/glass/glass-fiche-row";
import { getNumeroParId } from "@/lib/fiches";
import type { AvisGoogle } from "@/lib/mock-data";

export function AvisQueueCard({
  avis,
  active,
  onClick,
}: {
  avis: AvisGoogle;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <GlassFicheRow
      numero={getNumeroParId(avis.id)}
      date={avis.date}
      active={active}
      onClick={onClick}
      icon={
        <span className="flex items-center gap-0.5 text-gold">
          <Star className="size-3 fill-gold" />
          <span className="text-xs font-medium text-white">{avis.note}</span>
        </span>
      }
      titre={avis.auteur}
      origine={`Origine : avis reçu, ${avis.date}`}
    />
  );
}
