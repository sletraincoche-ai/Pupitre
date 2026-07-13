"use client";

import { useEffect, useState } from "react";
import { Plus, Disc3 } from "lucide-react";
import { GlassEmptyState } from "@/components/glass/glass-empty-state";
import { GlassModal } from "@/components/glass/glass-modal";
import { caveApi } from "@/lib/cave-api";

type CompteCrd = { id: string; categorie_fiscale: string; type_capsule: string; centilisation: string; stock: number };

const LABELS_CENTILISATION: Record<string, string> = {
  CL_75: "75 cL", CL_150: "Magnum (150 cL)", CL_37_5: "37,5 cL", CL_100: "100 cL",
};

// Comptes CRD (capsules représentatives de droits) — sans achats
// enregistrés ici, l'export DTI+ déclarerait toujours 0 capsule en stock
// dès qu'un dégorgement en consomme, ce qui rendrait le compte-crd
// arithmétiquement faux (stock-fin négatif, rejeté par la génération —
// voir lib/cave-export.ts, DrmValidationError).
export function CapsulesGlass() {
  const [comptes, setComptes] = useState<CompteCrd[]>([]);
  const [chargement, setChargement] = useState(true);
  const [creationCompte, setCreationCompte] = useState(false);
  const [modalAchat, setModalAchat] = useState<string | null>(null);
  const [quantite, setQuantite] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function rafraichir() {
    const { comptes } = (await caveApi.listerComptesCapsules()) as { comptes: CompteCrd[] };
    setComptes(comptes);
  }

  useEffect(() => {
    rafraichir().finally(() => setChargement(false));
  }, []);

  async function creerCompteDefaut() {
    setCreationCompte(true);
    try {
      await fetch("/api/cave/capsules", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
      await rafraichir();
    } finally {
      setCreationCompte(false);
    }
  }

  async function enregistrerAchat(e: React.FormEvent) {
    e.preventDefault();
    if (!modalAchat) return;
    setErreur(null);
    const q = Number(quantite);
    if (!Number.isInteger(q) || q <= 0) return setErreur("Quantité invalide.");

    setEnvoi(true);
    try {
      await caveApi.creerMouvementCapsules(modalAchat, { type: "achat", quantite: q });
      setModalAchat(null);
      setQuantite("");
      await rafraichir();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de l'enregistrement.");
    } finally {
      setEnvoi(false);
    }
  }

  if (chargement) return null;

  return (
    <div className="flex flex-col gap-3">
      {comptes.length === 0 ? (
        <>
          <GlassEmptyState
            icon={Disc3}
            title="Aucun compte de capsules"
            description="Un compte CRD (catégorie M, capsules personnalisées, 75 cL) est nécessaire pour déclarer un dégorgement dans l'export DTI+."
          />
          <button
            onClick={creerCompteDefaut}
            disabled={creationCompte}
            className="self-start rounded-full bg-gold px-4 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50"
          >
            {creationCompte ? "Création…" : "Créer le compte CRD (M / Personnalisées / 75 cL)"}
          </button>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {comptes.map((c) => (
            <div key={c.id} className="rounded-2xl border border-white/15 bg-black/20 p-4">
              <p className="text-sm font-medium text-white">{LABELS_CENTILISATION[c.centilisation] ?? c.centilisation}</p>
              <p className="text-xs text-white/55">
                {c.categorie_fiscale} — {c.type_capsule === "PERSONNALISEES" ? "Personnalisées" : c.type_capsule}
              </p>
              <p className="mt-2 font-heading text-2xl text-white tabular-nums">{c.stock}</p>
              <p className="text-xs text-white/55">capsules en stock</p>
              <button
                onClick={() => setModalAchat(c.id)}
                className="mt-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15"
              >
                <Plus className="size-3.5" />
                Achat
              </button>
            </div>
          ))}
        </div>
      )}

      <GlassModal open={!!modalAchat} onClose={() => setModalAchat(null)} title="Achat de capsules">
        <form onSubmit={enregistrerAchat} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-white/55">Quantité achetée</label>
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
          {erreur && <p className="text-xs text-red-300">{erreur}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalAchat(null)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
              Annuler
            </button>
            <button type="submit" disabled={envoi} className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50">
              {envoi ? "Enregistrement…" : "Enregistrer l'achat"}
            </button>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
