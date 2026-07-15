"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GlassModal } from "@/components/glass/glass-modal";
import { SaisieMouvement } from "@/components/cave/saisie-mouvement";
import { caveApi, type Produit } from "@/lib/cave-api";

// Écrit dans la vraie Cave (voir app/dashboard/cave/page.tsx et
// lib/cave-api.ts) — un seul point d'écriture, réutilisé tel quel par le
// chantier Visites (V1). Type découplé de lib/mock-data.ts : la
// réservation transmise ici vient désormais du vrai backend Visites
// (visites_reservations), plus jamais du mock.
//
// clientId n'est transmis que s'il s'agit d'un vrai uuid de la table
// clients (association automatique par email/téléphone, faite côté
// serveur lors de la création de la réservation — voir
// lib/visites-server.ts). visiteId permet d'afficher "vente enregistrée"
// sur la carte réservation (cave_mouvements.visite_id, lien d'affichage
// uniquement).
export type CibleVenteVisite = {
  id: string;
  visiteurNom: string;
  clientId?: string | null;
};

export function QuickSaleModal({
  visite,
  onClose,
}: {
  visite: CibleVenteVisite | null;
  onClose: () => void;
}) {
  const [produits, setProduits] = useState<Produit[]>([]);

  useEffect(() => {
    if (visite) caveApi.listerProduits().then((r) => setProduits(r.produits));
  }, [visite]);

  return (
    <GlassModal open={!!visite} onClose={onClose} title="Enregistrer une vente" maxWidthClassName="max-w-2xl">
      {visite &&
        (produits.length === 0 ? (
          <p className="text-sm text-white/60">
            Aucune cuvée déclarée en Cave pour l&apos;instant — créez-en une dans Cave avant d&apos;enregistrer une vente.
          </p>
        ) : (
          <SaisieMouvement
            produits={produits}
            typesAutorises={["vente_comptoir", "vente_client"]}
            typeInitial={visite.clientId ? "vente_client" : "vente_comptoir"}
            clientPreselectionne={{ id: visite.clientId ?? undefined, nom: visite.visiteurNom }}
            visiteId={visite.id}
            compact
            onCree={(mouvement) => {
              toast.success("Vente enregistrée", {
                description: `${mouvement.quantite_bouteilles} bout. — se propage à la Cave et à la DRM`,
              });
              onClose();
            }}
            onAnnuler={onClose}
          />
        ))}
    </GlassModal>
  );
}
