"use client";

import { Mail } from "lucide-react";
import { GlassFicheRow } from "@/components/glass/glass-fiche-row";
import { getNumeroParId, formatOrigine } from "@/lib/fiches";
import type { EmailCampagne } from "@/lib/mock-data";

export function MailQueueCard({
  campagne,
  active,
  onClick,
}: {
  campagne: EmailCampagne;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <GlassFicheRow
      numero={getNumeroParId(campagne.id)}
      date={campagne.date}
      active={active}
      onClick={onClick}
      icon={
        <span className="flex size-4 items-center justify-center rounded-md bg-white/10 text-white">
          <Mail className="size-2.5" />
        </span>
      }
      titre={campagne.objet}
      origine={formatOrigine(campagne.declencheur)}
    />
  );
}
