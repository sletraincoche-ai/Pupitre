"use client";

import { Mail } from "lucide-react";
import { FicheRow } from "@/components/studio/dossier/fiche-row";
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
    <FicheRow
      numero={getNumeroParId(campagne.id)}
      date={campagne.date}
      active={active}
      onClick={onClick}
      icon={
        <span className="flex size-4 items-center justify-center rounded-[2px] bg-ink/5 text-ink">
          <Mail className="size-2.5" />
        </span>
      }
      titre={campagne.objet}
      origine={formatOrigine(campagne.declencheur)}
    />
  );
}
