"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { SaisieMouvement } from "@/components/cave/saisie-mouvement";
import { caveApi, type Produit } from "@/lib/cave-api";
import type { Visite } from "@/lib/mock-data";

// Écrit désormais dans la vraie Cave (voir app/dashboard/cave/page.tsx
// et lib/cave-api.ts) au lieu du stock mock (lib/cave-context.tsx) —
// laisser une vente de dégustation sur le mock aurait recréé exactement
// le problème que la reconstruction de Cave corrige : un stock réel et
// un stock affiché déconnectés, et une DRM qui ignorerait ces ventes.
// Le reste de Visites (planning, fiches client affichées ici) reste sur
// mock-data.ts — seul ce point d'écriture a été rebranché, à la demande
// explicite de l'utilisateur.
export function QuickSaleModal({
  visite,
  onClose,
}: {
  visite: Visite | null;
  onClose: () => void;
}) {
  const [produits, setProduits] = useState<Produit[]>([]);

  useEffect(() => {
    if (visite) caveApi.listerProduits().then((r) => setProduits(r.produits));
  }, [visite]);

  return (
    <Modal open={!!visite} onClose={onClose} title="Enregistrer une vente" maxWidthClassName="max-w-2xl">
      {visite &&
        (produits.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune cuvée déclarée en Cave pour l&apos;instant — créez-en une dans Cave avant d&apos;enregistrer une vente.
          </p>
        ) : (
          // SaisieMouvement est stylé pour le fond translucide de Cave
          // (texte blanc) — ce Modal est resté sur l'ancienne charte
          // claire, d'où ce fond sombre local pour garder le contraste.
          <div className="rounded-2xl bg-ink p-4">
            <SaisieMouvement
              produits={produits}
              typesAutorises={["vente_comptoir", "vente_client"]}
              typeInitial={visite.clientId ? "vente_client" : "vente_comptoir"}
              clientPreselectionne={visite.clientId ? { id: visite.clientId, nom: visite.client } : undefined}
              compact
              onCree={(mouvement) => {
                toast.success("Vente enregistrée", {
                  description: `${mouvement.quantite_bouteilles} bout. — se propage à la Cave et à la DRM`,
                });
                onClose();
              }}
              onAnnuler={onClose}
            />
          </div>
        ))}
    </Modal>
  );
}
