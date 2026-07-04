"use client";

import { Modal } from "@/components/ui/modal";
import type { Cuvee, Mouvement } from "@/lib/mock-data";

const typeLabels: Record<Mouvement["type"], string> = {
  entree: "Entrée",
  sortie: "Sortie",
  perte: "Perte",
};

function Ligne({ label, valeur }: { label: string; valeur: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/50 py-2 text-sm last:border-0">
      <span className="text-stone">{label}</span>
      <span className="font-medium text-ink">{valeur}</span>
    </div>
  );
}

export function MovementDetailModal({
  mouvement,
  cuvee,
  onClose,
}: {
  mouvement: Mouvement | null;
  cuvee: Cuvee | undefined;
  onClose: () => void;
}) {
  return (
    <Modal open={!!mouvement} onClose={onClose} title="Détail du mouvement" maxWidthClassName="max-w-md">
      {mouvement && (
        <div className="flex flex-col gap-1">
          <Ligne
            label="Horodatage"
            valeur={`${new Date(mouvement.date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })} à ${mouvement.heure}`}
          />
          <Ligne label="Type" valeur={typeLabels[mouvement.type]} />
          <Ligne
            label="Cuvée"
            valeur={cuvee ? `${cuvee.nom}${cuvee.millesime !== "NV" ? ` ${cuvee.millesime}` : ""}` : "—"}
          />
          <Ligne label="Quantité" valeur={`${mouvement.quantite} bouteilles`} />
          <Ligne label="Origine" valeur={mouvement.origine} />
          {mouvement.clientNom && (
            <Ligne label="Client" valeur={mouvement.clientNom} />
          )}
          {mouvement.prixUnitaire !== undefined && (
            <>
              <Ligne label="Prix unitaire" valeur={`${mouvement.prixUnitaire} €`} />
              <Ligne
                label="Montant"
                valeur={`${(mouvement.prixUnitaire * mouvement.quantite).toLocaleString("fr-FR")} €`}
              />
            </>
          )}
          <Ligne label="Saisi par" valeur={mouvement.auteur} />
        </div>
      )}
    </Modal>
  );
}
