"use client";

import { InstagramBadge, FacebookBadge } from "@/components/studio/brand-icons";
import { GlassFicheRow } from "@/components/glass/glass-fiche-row";
import { formatOrigine } from "@/lib/fiches";
import type { PublicationReelle } from "@/lib/publications";

const formatLabels = { post: "Post", story: "Story", carrousel: "Carrousel" };

export function QueueCard({
  publication,
  active,
  onClick,
}: {
  publication: PublicationReelle;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <GlassFicheRow
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
      titre={`${formatLabels[publication.format]} — ${publication.legende || "Sans légende"}`}
      origine={formatOrigine()}
    />
  );
}
