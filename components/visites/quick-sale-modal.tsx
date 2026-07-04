"use client";

import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { MovementQuickEntry } from "@/components/cave/movement-quick-entry";
import { useCave } from "@/lib/cave-context";
import type { Visite } from "@/lib/mock-data";

export function QuickSaleModal({
  visite,
  onClose,
}: {
  visite: Visite | null;
  onClose: () => void;
}) {
  const { cuvees, mouvements, ajouterMouvement, creerCuvee } = useCave();

  return (
    <Modal
      open={!!visite}
      onClose={onClose}
      title="Enregistrer une vente"
      maxWidthClassName="max-w-2xl"
    >
      {visite && (
        <MovementQuickEntry
          type="sortie"
          cuvees={cuvees}
          mouvements={mouvements}
          showHeader={false}
          clientPreselectionne={
            visite.clientId ? { id: visite.clientId, nom: visite.client } : undefined
          }
          onCreateCuvee={creerCuvee}
          onSubmit={(mouvement) => {
            ajouterMouvement(mouvement);
            toast.success("Vente enregistrée", {
              description: `${mouvement.quantite} bout. — se propage à la Cave et à la DRM`,
            });
            onClose();
          }}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}
