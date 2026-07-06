"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DrmBanner } from "@/components/cave/drm-banner";
import { MovementsRegistry } from "@/components/cave/movements-registry";
import { StockTable } from "@/components/cave/stock-table";
import { CuveeStoryModal } from "@/components/cave/cuvee-story-modal";
import { useCave } from "@/lib/cave-context";
import type { Cuvee } from "@/lib/mock-data";

export default function CavePage() {
  const { cuvees, mouvements, ajouterMouvement, creerCuvee } = useCave();
  const [cuveePourHistoire, setCuveePourHistoire] = useState<Cuvee | null>(null);

  function creerCuveeEtProposerHistoire(nom: string): Cuvee {
    const nouvelle = creerCuvee(nom);
    toast.success(`Nouvelle cuvée créée : ${nom}`, {
      description: "Racontez son histoire pour enrichir votre charte narrative.",
      action: { label: "Raconter l'histoire", onClick: () => setCuveePourHistoire(nouvelle) },
    });
    return nouvelle;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl text-ink">Cave</h1>
        <p className="mt-1 text-stone">
          Le registre de vos mouvements — moteur du stock, de la DRM et de vos fiches clients.
        </p>
      </div>

      <DrmBanner cuvees={cuvees} mouvements={mouvements} />

      <MovementsRegistry
        cuvees={cuvees}
        mouvements={mouvements}
        onAddMouvement={ajouterMouvement}
        onCreateCuvee={creerCuveeEtProposerHistoire}
      />

      <StockTable cuvees={cuvees} mouvements={mouvements} />

      <CuveeStoryModal cuvee={cuveePourHistoire} onClose={() => setCuveePourHistoire(null)} />
    </div>
  );
}
