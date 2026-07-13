"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { facturationApi, type Client, type DocumentFacturation, type LignePayload, type TypeDocumentFacturation, type VenteComptoirDisponible } from "@/lib/facturation-api";
import type { Produit } from "@/lib/cave-api";

const LABELS_TYPE: Record<TypeDocumentFacturation, string> = { devis: "Devis", bon_livraison: "Bon de livraison", facture: "Facture", avoir: "Avoir" };

function prixParProfil(produit: Produit, profil: Client["profil"]): number {
  const parProfilBrut = produit as unknown as { prix_particulier: number | null; prix_professionnel: number | null; prix_chr: number | null };
  const parProfil = { particulier: parProfilBrut.prix_particulier, professionnel: parProfilBrut.prix_professionnel, chr: parProfilBrut.prix_chr }[profil];
  return parProfil ?? produit.prix_vente_defaut ?? 0;
}

type LigneFormulaire = LignePayload & { cle: string };

export function NouveauDocumentForm({
  produits,
  clients,
  typeInitial = "devis",
  onCree,
  onAnnuler,
}: {
  produits: Produit[];
  clients: Client[];
  typeInitial?: TypeDocumentFacturation;
  onCree: (document: DocumentFacturation) => void;
  onAnnuler: () => void;
}) {
  const [type, setType] = useState<TypeDocumentFacturation>(typeInitial);
  const [clientId, setClientId] = useState("");
  const [lignes, setLignes] = useState<LigneFormulaire[]>([]);
  const [ventesDisponibles, setVentesDisponibles] = useState<VenteComptoirDisponible[]>([]);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const client = clients.find((c) => c.id === clientId);

  useEffect(() => {
    facturationApi.ventesComptoirDisponibles().then((r) => setVentesDisponibles(r.ventes));
  }, []);

  function ajouterLigneProduit(produitId: string) {
    const produit = produits.find((p) => p.id === produitId);
    if (!produit) return;
    setLignes((prev) => [
      ...prev,
      {
        cle: crypto.randomUUID(),
        designation: `${produit.nom}${produit.millesime ? ` (${produit.millesime})` : ""}`,
        quantite: 1,
        prixUnitaireHt: client ? prixParProfil(produit, client.profil) : (produit.prix_vente_defaut ?? 0),
        tauxTva: 20,
        caveProduitId: produit.id,
      },
    ]);
  }

  function ajouterLigneVenteComptoir(vente: VenteComptoirDisponible) {
    setLignes((prev) => [
      ...prev,
      {
        cle: crypto.randomUUID(),
        designation: `${vente.cave_produits?.nom ?? "Cuvée"}${vente.cave_produits?.millesime ? ` (${vente.cave_produits.millesime})` : ""} — vente comptoir du ${new Date(vente.horodatage).toLocaleDateString("fr-FR")}`,
        quantite: vente.quantite_bouteilles,
        prixUnitaireHt: vente.prix_unitaire ?? 0,
        tauxTva: 20,
        caveMouvementId: vente.id,
      },
    ]);
    setVentesDisponibles((prev) => prev.filter((v) => v.id !== vente.id));
  }

  function ajouterLigneLibre() {
    setLignes((prev) => [...prev, { cle: crypto.randomUUID(), designation: "", quantite: 1, prixUnitaireHt: 0, tauxTva: 20 }]);
  }

  function modifierLigne(cle: string, patch: Partial<LigneFormulaire>) {
    setLignes((prev) => prev.map((l) => (l.cle === cle ? { ...l, ...patch } : l)));
  }

  function supprimerLigne(cle: string) {
    setLignes((prev) => prev.filter((l) => l.cle !== cle));
  }

  const totalHt = lignes.reduce((t, l) => t + l.quantite * l.prixUnitaireHt, 0);
  const totalTtc = lignes.reduce((t, l) => t + l.quantite * l.prixUnitaireHt * (1 + (l.tauxTva ?? 20) / 100), 0);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    if (lignes.length === 0) return setErreur("Ajoutez au moins une ligne.");
    if (lignes.some((l) => !l.designation.trim() || l.quantite <= 0)) return setErreur("Chaque ligne doit avoir une désignation et une quantité positive.");

    setEnvoi(true);
    try {
      const { document } = await facturationApi.creerDocument({
        type,
        clientId: clientId || undefined,
        lignes: lignes.map(({ cle: _cle, ...l }) => l),
      });
      onCree(document);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de la création.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <form onSubmit={soumettre} className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(LABELS_TYPE) as TypeDocumentFacturation[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              type === t ? "border-gold/40 bg-gold/20 text-gold" : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {LABELS_TYPE[t]}
          </button>
        ))}
      </div>

      <div>
        <label className="mb-1 block text-xs text-white/55">Client</label>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
        >
          <option value="" className="bg-ink text-white">
            Sans client (vente directe)
          </option>
          {clients.map((c) => (
            <option key={c.id} value={c.id} className="bg-ink text-white">
              {c.nom} — {c.profil}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
        {lignes.length === 0 && <p className="text-xs text-white/50">Aucune ligne — ajoutez une cuvée, une vente comptoir existante, ou une ligne libre.</p>}
        {lignes.map((l) => (
          <div key={l.cle} className="flex items-center gap-2">
            <input
              value={l.designation}
              onChange={(e) => modifierLigne(l.cle, { designation: e.target.value })}
              placeholder="Désignation"
              className="h-9 min-w-0 flex-1 rounded-lg border border-white/15 bg-white/10 px-2 text-sm text-white outline-none focus:border-white/30"
            />
            <input
              type="number"
              min={0}
              step="any"
              value={l.quantite}
              onChange={(e) => modifierLigne(l.cle, { quantite: Number(e.target.value) })}
              className="h-9 w-16 rounded-lg border border-white/15 bg-white/10 px-2 text-sm text-white outline-none focus:border-white/30"
              title="Quantité"
            />
            <input
              type="number"
              min={0}
              step={0.01}
              value={l.prixUnitaireHt}
              onChange={(e) => modifierLigne(l.cle, { prixUnitaireHt: Number(e.target.value) })}
              className="h-9 w-20 rounded-lg border border-white/15 bg-white/10 px-2 text-sm text-white outline-none focus:border-white/30"
              title="Prix unitaire HT"
            />
            <button type="button" onClick={() => supprimerLigne(l.cle)} className="flex size-7 shrink-0 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-red-300">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}

        <div className="flex flex-wrap gap-1.5 pt-1">
          <select
            onChange={(e) => {
              if (e.target.value) ajouterLigneProduit(e.target.value);
              e.target.value = "";
            }}
            className="h-8 rounded-full border border-white/15 bg-white/10 px-3 text-xs text-white outline-none"
            defaultValue=""
          >
            <option value="" disabled className="bg-ink">
              + Cuvée…
            </option>
            {produits.filter((p) => !p.archive).map((p) => (
              <option key={p.id} value={p.id} className="bg-ink text-white">
                {p.nom} {p.millesime ? `(${p.millesime})` : ""}
              </option>
            ))}
          </select>
          {ventesDisponibles.length > 0 && (
            <select
              onChange={(e) => {
                const vente = ventesDisponibles.find((v) => v.id === e.target.value);
                if (vente) ajouterLigneVenteComptoir(vente);
                e.target.value = "";
              }}
              className="h-8 rounded-full border border-white/15 bg-white/10 px-3 text-xs text-white outline-none"
              defaultValue=""
            >
              <option value="" disabled className="bg-ink">
                + Vente comptoir à facturer…
              </option>
              {ventesDisponibles.map((v) => (
                <option key={v.id} value={v.id} className="bg-ink text-white">
                  {v.cave_produits?.nom} — {v.quantite_bouteilles} bout. — {new Date(v.horodatage).toLocaleDateString("fr-FR")}
                </option>
              ))}
            </select>
          )}
          <button type="button" onClick={ajouterLigneLibre} className="flex h-8 items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 text-xs text-white/80 hover:bg-white/15">
            <Plus className="size-3" />
            Ligne libre
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-4 text-sm text-white/80">
        <span>Total HT : {totalHt.toFixed(2)} €</span>
        <span className="font-medium text-white">Total TTC : {totalTtc.toFixed(2)} €</span>
      </div>

      {erreur && <p className="text-xs text-red-300">{erreur}</p>}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onAnnuler} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
          Annuler
        </button>
        <button type="submit" disabled={envoi} className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50">
          {envoi ? "Création…" : "Créer le brouillon"}
        </button>
      </div>
    </form>
  );
}
