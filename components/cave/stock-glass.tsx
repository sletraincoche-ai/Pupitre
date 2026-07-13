"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { LigneStock, Produit } from "@/lib/cave-api";
import { caveApi } from "@/lib/cave-api";
import { GlassPanel } from "@/components/glass/glass-panel";
import { GlassEmptyState } from "@/components/glass/glass-empty-state";
import { GlassModal } from "@/components/glass/glass-modal";
import { Warehouse } from "lucide-react";

export function StockGlass({
  stock,
  produits,
  onProduitModifie,
}: {
  stock: LigneStock[];
  produits: Produit[];
  onProduitModifie: (produit: Produit) => void;
}) {
  const [produitEnEdition, setProduitEnEdition] = useState<Produit | null>(null);
  const [prixSaisi, setPrixSaisi] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const lignes = stock.filter((l) => !l.archive);

  function ouvrirEdition(produit: Produit) {
    setProduitEnEdition(produit);
    setPrixSaisi(produit.prix_vente_defaut != null ? String(produit.prix_vente_defaut) : "");
    setErreur(null);
  }

  async function enregistrerPrix(e: React.FormEvent) {
    e.preventDefault();
    if (!produitEnEdition) return;
    const prix = Number(prixSaisi);
    if (!Number.isFinite(prix) || prix < 0) return setErreur("Prix invalide.");

    setEnvoi(true);
    try {
      const { produit } = await caveApi.modifierProduit(produitEnEdition.id, { prixVenteDefaut: prix });
      onProduitModifie(produit);
      setProduitEnEdition(null);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de l'enregistrement.");
    } finally {
      setEnvoi(false);
    }
  }

  if (lignes.length === 0) {
    return (
      <GlassPanel intensity="light" className="p-2">
        <GlassEmptyState icon={Warehouse} title="Aucune cuvée déclarée" description="Créez votre première cuvée pour commencer le registre." />
      </GlassPanel>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {lignes.map((l) => {
          const produit = produits.find((p) => p.id === l.produitId);
          return (
            <GlassPanel key={l.produitId} intensity="light" className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{l.nom}</p>
                  {l.millesime && <p className="text-xs text-white/55">{l.millesime}</p>}
                </div>
                {produit && (
                  <button
                    onClick={() => ouvrirEdition(produit)}
                    aria-label="Modifier le prix"
                    className="flex size-6 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/60 hover:text-white"
                  >
                    <Pencil className="size-3" />
                  </button>
                )}
              </div>
              <p className="mt-2 font-heading text-2xl text-white tabular-nums">{l.stockBouteilles}</p>
              <p className="text-xs text-white/55">bouteilles — {l.stockHl.toFixed(2)} hL</p>
              <p className="mt-1 text-xs text-gold">
                {produit?.prix_vente_defaut != null ? `${produit.prix_vente_defaut.toFixed(2)} € / bout.` : "Prix non défini"}
              </p>
            </GlassPanel>
          );
        })}
      </div>

      <GlassModal open={!!produitEnEdition} onClose={() => setProduitEnEdition(null)} title={`Prix — ${produitEnEdition?.nom ?? ""}`}>
        <form onSubmit={enregistrerPrix} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-white/55">Prix de vente par défaut (€)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={prixSaisi}
              onChange={(e) => setPrixSaisi(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
            />
          </div>
          {erreur && <p className="text-xs text-red-300">{erreur}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setProduitEnEdition(null)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
              Annuler
            </button>
            <button type="submit" disabled={envoi} className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50">
              {envoi ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </GlassModal>
    </>
  );
}
