"use client";

import { InstagramBadge, FacebookBadge } from "@/components/studio/brand-icons";
import { FicheRow } from "@/components/studio/dossier/fiche-row";
import { getNumeroParId, formatOrigine } from "@/lib/fiches";
import type { PublicationSociale } from "@/lib/mock-data";

const formatLabels = { post: "Post", story: "Story", carrousel: "Carrousel" };

export function QueueCard({
  publication,
  active,
  onClick,
}: {
  publication: PublicationSociale;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <FicheRow
      numero={getNumeroParId(publication.id)}
      date={publication.date}
      active={active}
      onClick={onClick}
      icon={
        publication.plateforme === "Instagram" ? (
          <InstagramBadge className="size-4" />
        ) : (
          <FacebookBadge className="size-4" />
        )
      }
      titre={`${formatLabels[publication.format]} — ${publication.legende}`}
      origine={formatOrigine(publication.declencheur)}
    />
  );
}
