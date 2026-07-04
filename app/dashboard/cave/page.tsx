"use client";

import { DrmBanner } from "@/components/cave/drm-banner";
import { MovementsRegistry } from "@/components/cave/movements-registry";
import { StockTable } from "@/components/cave/stock-table";
import { useCave } from "@/lib/cave-context";

export default function CavePage() {
  const { cuvees, mouvements, ajouterMouvement, creerCuvee } = useCave();

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
