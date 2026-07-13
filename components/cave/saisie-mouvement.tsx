"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { caveApi, type Produit, type TypeMouvement, type Mouvement } from "@/lib/cave-api";
import { ProduitSelect } from "@/components/cave/produit-select";

const LABELS_TYPE: Record<TypeMouvement, string> = {
  tirage: "Tirage (mise en cave)",
  degorgement: "Dégorgement",
  vente_comptoir: "Vente comptoir",
  vente_client: "Vente client",
  export: "Export",
  perte: "Perte",
  entree_acquitte: "Achat (droits acquittés)",
};

const OBSERVATION_OBLIGATOIRE: TypeMouvement[] = ["perte"];

// Formulaire de saisie réutilisé tel quel par la page Cave (tous types)
// et par components/visites/quick-sale-modal.tsx (vente comptoir en
// dégustation, typesAutorises=['vente_comptoir']) — un seul point
// d'écriture vers /api/cave/mouvements, budget de friction 15s / 1-2
// taps : produit + type déjà présélectionnés dans les cas d'usage
// contraints, il ne reste que la quantité à saisir.
export function SaisieMouvement({
  produits,
  typesAutorises = Object.keys(LABELS_TYPE) as TypeMouvement[],
  produitIdInitial,
  typeInitial,
  clientPreselectionne,
  compact = false,
  onCree,
  onAnnuler,
}: {
  produits: Produit[];
  typesAutorises?: TypeMouvement[];
  produitIdInitial?: string;
  typeInitial?: TypeMouvement;
  clientPreselectionne?: { id?: string; nom: string };
  compact?: boolean;
  onCree: (mouvement: Mouvement) => void;
  onAnnuler?: () => void;
}) {
  const [produitId, setProduitId] = useState(produitIdInitial ?? "");
  const [type, setType] = useState<TypeMouvement>(typeInitial ?? typesAutorises[0]);
  const [quantite, setQuantite] = useState("");
  const [prixUnitaire, setPrixUnitaire] = useState("");
  const [observations, setObservations] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const produitChoisi = produits.find((p) => p.id === produitId);
  const estVente = type === "vente_comptoir" || type === "vente_client" || type === "export";

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    const quantiteNombre = Number(quantite);
    if (!produitId) return setErreur("Choisissez une cuvée.");
    if (!Number.isInteger(quantiteNombre) || quantiteNombre <= 0) return setErreur("Quantité invalide.");
    if (OBSERVATION_OBLIGATOIRE.includes(type) && !observations.trim()) {
      return setErreur("Une observation est requise pour ce type de mouvement.");
    }

    setEnvoi(true);
    try {
      const { mouvement } = await caveApi.creerMouvement({
        produitId,
        type,
        quantiteBouteilles: quantiteNombre,
        contenance: produitChoisi?.contenance_defaut,
        origine: LABELS_TYPE[type],
        clientId: clientPreselectionne?.id,
        clientNom: clientPreselectionne?.nom,
        prixUnitaire: prixUnitaire ? Number(prixUnitaire) : undefined,
        observations: observations || undefined,
      });
      onCree(mouvement);
      setQuantite("");
      setObservations("");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de l'enregistrement.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <form onSubmit={soumettre} className={cn("flex flex-col gap-3", compact && "gap-2.5")}>
      {typesAutorises.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {typesAutorises.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                type === t
                  ? "border-gold/40 bg-gold/20 text-gold"
                  : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
              )}
            >
              {LABELS_TYPE[t]}
            </button>
          ))}
        </div>
      )}

      <ProduitSelect produits={produits} value={produitId} onChange={setProduitId} />

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-white/55">Bouteilles</label>
          <input
            type="number"
            min={1}
            step={1}
            value={quantite}
            onChange={(e) => setQuantite(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
            placeholder="0"
          />
        </div>
        {estVente && (
          <div className="flex-1">
            <label className="mb-1 block text-xs text-white/55">Prix unitaire (€)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={prixUnitaire}
              onChange={(e) => setPrixUnitaire(e.target.value)}
              placeholder={produitChoisi?.prix_vente_defaut ? String(produitChoisi.prix_vente_defaut) : "0"}
              className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
            />
          </div>
        )}
      </div>

      {OBSERVATION_OBLIGATOIRE.includes(type) && (
        <div>
          <label className="mb-1 block text-xs text-white/55">Observation (obligatoire — exigée par le DTI+)</label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            placeholder="Ex : casse en cave, contrôle de stock…"
          />
        </div>
      )}

      {erreur && <p className="text-xs text-red-300">{erreur}</p>}

      <div className="flex justify-end gap-2">
        {onAnnuler && (
          <button
            type="button"
            onClick={onAnnuler}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={envoi}
          className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50"
        >
          {envoi ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
