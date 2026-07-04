"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Check } from "lucide-react";
import { ReviewCard } from "@/components/studio/avis/review-card";
import { EmptyState } from "@/components/empty-state";
import { avisGoogle as avisInitiaux } from "@/lib/mock-data";

export default function AvisPage() {
  const [avis, setAvis] = useState(avisInitiaux);

  function retirer(id: string) {
    setAvis((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard/studio" className="flex w-fit items-center gap-1.5 text-sm text-stone hover:text-vine">
        <ArrowLeft className="size-4" />
        Retour au Studio
      </Link>

      <div>
        <h1 className="font-heading text-3xl text-ink">Atelier avis Google</h1>
        <p className="mt-1 text-stone">{avis.length} avis à traiter.</p>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        {avis.length === 0 && (
          <EmptyState
            icon={Check}
            title="Tous les avis sont traités"
            description="Le prochain avis reçu apparaîtra ici automatiquement."
          />
        )}
        {avis.map((a) => (
          <ReviewCard
            key={a.id}
            avis={a}
            onPublier={(reponse) => {
              toast.success(`Réponse publiée à ${a.auteur}`, { description: reponse.slice(0, 60) + (reponse.length > 60 ? "…" : "") });
              retirer(a.id);
            }}
            onIgnorer={() => {
              toast.info("Avis ignoré");
              retirer(a.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}
