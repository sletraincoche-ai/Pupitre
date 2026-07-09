"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { AvisQueueCard } from "@/components/studio/avis/avis-queue-card";
import { ReviewPreview, ReviewResponseEditor } from "@/components/studio/avis/review-card";
import { GlassEmptyState } from "@/components/glass/glass-empty-state";
import { GlassPageShell } from "@/components/glass/glass-page-shell";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassThreeColumns, GlassColumnPanel } from "@/components/glass/glass-column-panel";
import { getNumeroParId } from "@/lib/fiches";
import { avisGoogle as avisInitiaux, type AvisGoogle } from "@/lib/mock-data";

export default function AvisPage() {
  const [queue, setQueue] = useState(avisInitiaux);
  const [sourceId, setSourceId] = useState<string | null>(queue[0]?.id ?? null);

  const selection = sourceId ? queue.find((a) => a.id === sourceId) : undefined;
  const numero = sourceId ? getNumeroParId(sourceId) : undefined;

  function charger(avis: AvisGoogle) {
    setSourceId(avis.id);
  }

  function retirer(id: string) {
    setQueue((prev) => prev.filter((a) => a.id !== id));
    const reste = queue.filter((a) => a.id !== id);
    setSourceId(reste[0]?.id ?? null);
  }

  return (
    <GlassPageShell fill>
      <GlassPageHeader title="Avis Google" subtitle={`${queue.length} avis à traiter.`} />

      <GlassThreeColumns className="lg:min-h-0 lg:flex-1">
        <GlassColumnPanel label={`File d'attente (${queue.length})`}>
          {queue.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/50">File vide.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {queue.map((a) => (
                <AvisQueueCard key={a.id} avis={a} active={sourceId === a.id} onClick={() => charger(a)} />
              ))}
            </div>
          )}
        </GlassColumnPanel>

        <GlassColumnPanel bare>
          {!selection ? (
            <GlassEmptyState
              icon={Check}
              title="Tous les avis sont traités"
              description="Le prochain avis reçu apparaîtra ici automatiquement."
            />
          ) : (
            <ReviewPreview avis={selection} />
          )}
        </GlassColumnPanel>

        <GlassColumnPanel label="Détail & publication">
          {!selection ? (
            <p className="py-8 text-center text-sm text-white/50">—</p>
          ) : (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-lg font-semibold tracking-tight text-white">
                  {numero ? `Fiche N°${numero}` : ""}
                </p>
                <p className="font-mono text-xs text-white/55">Origine : avis reçu, {selection.date}</p>
              </div>

              <ReviewResponseEditor
                key={selection.id}
                avis={selection}
                onPublier={(reponse) => {
                  toast.success(`Réponse publiée à ${selection.auteur}`, {
                    description: reponse.slice(0, 60) + (reponse.length > 60 ? "…" : ""),
                  });
                  retirer(selection.id);
                }}
                onIgnorer={() => {
                  toast.info("Avis ignoré");
                  retirer(selection.id);
                }}
              />
            </div>
          )}
        </GlassColumnPanel>
      </GlassThreeColumns>
    </GlassPageShell>
  );
}
