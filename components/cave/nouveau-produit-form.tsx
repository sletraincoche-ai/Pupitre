"use client";

import { useState } from "react";
import { GlassNumberInput } from "@/components/glass/glass-number-input";
import { caveApi, type Produit } from "@/lib/cave-api";

const LIBELLES_FISCAUX_CHAMPAGNE = [
  { valeur: "VM_IG_AOP", label: "Vin mousseux IG — AOP (Champagne)" },
  { valeur: "VM_IG_IGP", label: "Vin mousseux IG — IGP" },
];

// Formulaire de création d'une cuvée déclarative — libelle_personnalise
// devient l'identifiant fiscal permanent (RG4 du XSD), jamais modifiable
// ensuite : on le préremplit depuis le nom mais l'utilisateur peut le
// corriger avant la première sauvegarde, jamais après.
export function NouveauProduitForm({ onCree, onAnnuler }: { onCree: (produit: Produit) => void; onAnnuler: () => void }) {
  const [nom, setNom] = useState("");
  const [millesime, setMillesime] = useState("NV");
  const [libellePersonnalise, setLibellePersonnalise] = useState("");
  const [libelleFiscal, setLibelleFiscal] = useState(LIBELLES_FISCAUX_CHAMPAGNE[0].valeur);
  const [tav, setTav] = useState(12.5);
  const [prixVenteDefaut, setPrixVenteDefaut] = useState(0);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    if (!nom.trim()) return setErreur("Nom requis.");
    if (!libellePersonnalise.trim()) return setErreur("Libellé personnalisé requis.");

    setEnvoi(true);
    try {
      const { produit } = await caveApi.creerProduit({
        nom: nom.trim(),
        millesime: millesime.trim() || undefined,
        libellePersonnalise: libellePersonnalise.trim(),
        libelleFiscal,
        tav: tav || undefined,
        prixVenteDefaut: prixVenteDefaut || undefined,
      });
      onCree(produit);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de la création.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <form onSubmit={soumettre} className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-xs text-white/55">Nom de la cuvée</label>
        <input
          value={nom}
          onChange={(e) => {
            setNom(e.target.value);
            if (!libellePersonnalise) setLibellePersonnalise(e.target.value);
          }}
          className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
          placeholder="Ex : Brut Réserve"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-white/55">Millésime</label>
          <input
            value={millesime}
            onChange={(e) => setMillesime(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
            placeholder="NV ou année"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-white/55">TAV (%)</label>
          <GlassNumberInput step={0.1} min={0} value={tav} onChange={setTav} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-white/55">Catégorie fiscale DTI+</label>
        <select
          value={libelleFiscal}
          onChange={(e) => setLibelleFiscal(e.target.value)}
          className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
        >
          {LIBELLES_FISCAUX_CHAMPAGNE.map((l) => (
            <option key={l.valeur} value={l.valeur} className="bg-ink text-white">
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-white/55">
          Libellé personnalisé — identifiant fiscal permanent, non modifiable ensuite
        </label>
        <input
          value={libellePersonnalise}
          onChange={(e) => setLibellePersonnalise(e.target.value)}
          className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-white/55">Prix de vente par défaut (€)</label>
        <GlassNumberInput step={0.01} min={0} value={prixVenteDefaut} onChange={setPrixVenteDefaut} />
      </div>

      {erreur && <p className="text-xs text-red-300">{erreur}</p>}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onAnnuler} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
          Annuler
        </button>
        <button type="submit" disabled={envoi} className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50">
          {envoi ? "Création…" : "Créer la cuvée"}
        </button>
      </div>
    </form>
  );
}
