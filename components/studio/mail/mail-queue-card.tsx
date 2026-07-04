"use client";

import { Zap } from "lucide-react";
import type { EmailCampagne } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

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
    <button
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-2 rounded-xl border p-4 text-left transition-colors",
        active ? "border-vine bg-vine/5" : "border-border/70 bg-card hover:border-vine/40"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink">{campagne.objet}</span>
        <span className="text-xs text-stone">{campagne.date}</span>
      </div>
      {campagne.declencheur && (
        <p className="flex items-start gap-1.5 text-xs font-medium text-gold">
          <Zap className="mt-0.5 size-3 shrink-0" />
          {campagne.declencheur}
        </p>
      )}
      <p className="line-clamp-2 text-sm text-stone">{campagne.corps}</p>
      <span className="text-xs text-stone">
        {campagne.segment} · {campagne.nombreDestinataires} destinataires
      </span>
    </button>
  );
}
