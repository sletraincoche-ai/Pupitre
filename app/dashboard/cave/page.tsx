"use client";

import { useState } from "react";
import { DrmBanner } from "@/components/cave/drm-banner";
import { MovementsRegistry } from "@/components/cave/movements-registry";
import { StockTable } from "@/components/cave/stock-table";
import {
  cuvees as cuveesInitiales,
  mouvements as mouvementsInitiaux,
  type Cuvee,
  type Mouvement,
} from "@/lib/mock-data";

export default function CavePage() {
  const [cuvees, setCuvees] = useState<Cuvee[]>(cuveesInitiales);
  const [mouvements, setMouvements] = useState<Mouvement[]>(mouvementsInitiaux);

  function ajouterMouvement(mouvement: Mouvement) {
    setMouvements((prev) => [mouvement, ...prev]);
  }

  function creerCuvee(nom: string): Cuvee {
    const nouvelle: Cuvee = {
      id: `cv-${Date.now()}`,
      nom,
      millesime: "NV",
      prixVenteDefaut: 0,
      stockInitial: 0,
      reserve: 0,
      alloue: 0,
    };
    setCuvees((prev) => [...prev, nouvelle]);
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
        onCreateCuvee={creerCuvee}
      />

      <StockTable cuvees={cuvees} mouvements={mouvements} />
    </div>
  );
}
