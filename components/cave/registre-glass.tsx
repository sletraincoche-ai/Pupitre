"use client";

import { useState } from "react";
import type { Mouvement } from "@/lib/cave-api";
import { caveApi } from "@/lib/cave-api";
import { GlassEmptyState } from "@/components/glass/glass-empty-state";
import { GlassModal } from "@/components/glass/glass-modal";
import { ScrollText, ArrowDownToLine, ArrowUpFromLine, Sparkles, AlertTriangle, X } from "lucide-react";

const LABELS: Record<Mouvement["type"], string> = {
  tirage: "Tirage",
  degorgement: "Dégorgement",
  vente_comptoir: "Vente comptoir",
  vente_client: "Vente client",
  export: "Export",
  perte: "Perte",
  entree_acquitte: "Achat",
};

function IconePourType({ type }: { type: Mouvement["type"] }) {
  if (type === "tirage" || type === "entree_acquitte") return <ArrowDownToLine className="size-4 text-emerald-300" />;
  if (type === "perte") return <AlertTriangle className="size-4 text-red-300" />;
  if (type === "degorgement") return <Sparkles className="size-4 text-gold" />;
  return <ArrowUpFromLine className="size-4 text-sky-300" />;
}

// Annuler ≠ supprimer : le mouvement reste ici, visible, marqué et
// horodaté (traçabilité totale) — voir
// app/api/cave/mouvements/[id]/annuler/route.ts. Pour corriger une
// erreur de saisie : annuler ce mouvement, puis en saisir un nouveau.
export function RegistreGlass({ mouvements, onAnnule }: { mouvements: Mouvement[]; onAnnule: (mouvement: Mouvement) => void }) {
  const [mouvementAAnnuler, setMouvementAAnnuler] = useState<Mouvement | null>(null);
  const [motif, setMotif] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function confirmerAnnulation(e: React.FormEvent) {
    e.preventDefault();
    if (!mouvementAAnnuler) return;
    if (!motif.trim()) return setErreur("Un motif est requis.");

    setEnvoi(true);
    try {
      const { mouvement } = await caveApi.annulerMouvement(mouvementAAnnuler.id, motif.trim());
      onAnnule(mouvement);
      setMouvementAAnnuler(null);
      setMotif("");
      setErreur(null);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de l'annulation.");
    } finally {
      setEnvoi(false);
    }
  }

  if (mouvements.length === 0) {
    return <GlassEmptyState icon={ScrollText} title="Aucun mouvement" description="Les entrées, sorties et pertes saisies apparaîtront ici, horodatées." />;
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        {mouvements.map((m) => (
          <div key={m.id} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 ${m.annule ? "opacity-45" : ""}`}>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10">
              <IconePourType type={m.type} />
            </span>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm text-white ${m.annule ? "line-through" : ""}`}>
                {LABELS[m.type]} — {m.cave_produits?.nom ?? "Cuvée"} {m.cave_produits?.millesime ? `(${m.cave_produits.millesime})` : ""}
              </p>
              {m.annule ? (
                <p className="truncate text-xs text-red-300">
                  Annulé par {m.annule_par} — {m.motif_annulation}
                </p>
              ) : (
                <p className="truncate text-xs text-white/55">
                  {m.quantite_bouteilles} bout. {m.client_nom ? `— ${m.client_nom}` : ""} — {m.auteur}
                </p>
              )}
            </div>
            <span className="shrink-0 font-mono text-xs text-white/50 tabular-nums">
              {new Date(m.horodatage).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
            </span>
            {!m.annule && (
              <button
                onClick={() => {
                  setMouvementAAnnuler(m);
                  setMotif("");
                  setErreur(null);
                }}
                aria-label="Annuler ce mouvement"
                className="flex size-6 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/50 hover:border-red-400/40 hover:text-red-300"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      <GlassModal open={!!mouvementAAnnuler} onClose={() => setMouvementAAnnuler(null)} title="Annuler ce mouvement">
        <form onSubmit={confirmerAnnulation} className="flex flex-col gap-3">
          <p className="text-xs text-white/60">
            {mouvementAAnnuler && `${LABELS[mouvementAAnnuler.type]} — ${mouvementAAnnuler.quantite_bouteilles} bout.`} Le mouvement reste visible dans le
            registre, marqué annulé — il n&apos;est jamais supprimé.
          </p>
          <div>
            <label className="mb-1 block text-xs text-white/55">Motif (obligatoire)</label>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
              placeholder="Ex : erreur de quantité, mauvaise cuvée sélectionnée…"
            />
          </div>
          {erreur && <p className="text-xs text-red-300">{erreur}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setMouvementAAnnuler(null)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
              Retour
            </button>
            <button type="submit" disabled={envoi} className="rounded-full bg-red-500/80 px-5 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50">
              {envoi ? "Annulation…" : "Confirmer l'annulation"}
            </button>
          </div>
        </form>
      </GlassModal>
    </>
  );
}
