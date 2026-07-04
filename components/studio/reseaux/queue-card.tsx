"use client";

import { Zap } from "lucide-react";
import { InstagramBadge, FacebookBadge } from "@/components/studio/brand-icons";
import type { PublicationSociale } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

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
    <button
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-2 rounded-xl border p-4 text-left transition-colors",
        active ? "border-vine bg-vine/5" : "border-border/70 bg-card hover:border-vine/40"
      )}
    >
      <div className="flex items-center gap-2">
        {publication.plateforme === "Instagram" ? (
          <InstagramBadge className="size-6" />
        ) : (
          <FacebookBadge className="size-6" />
        )}
        <span className="text-sm font-medium text-ink">{formatLabels[publication.format]}</span>
        <span className="ml-auto text-xs text-stone">{publication.date}</span>
      </div>
      {publication.declencheur && (
        <p className="flex items-start gap-1.5 text-xs font-medium text-gold">
          <Zap className="mt-0.5 size-3 shrink-0" />
          {publication.declencheur}
        </p>
      )}
      <p className="line-clamp-2 text-sm text-stone">{publication.legende}</p>
    </button>
  );
}
