"use client";

import { useState } from "react";
import { Plus, Archive, Wine } from "lucide-react";
import { GlassEmptyState } from "@/components/glass/glass-empty-state";
import { GlassModal } from "@/components/glass/glass-modal";
import { visitesApi, type Formule } from "@/lib/visites-api";

export function FormulesGlass({ formules, onMaj }: { formules: Formule[]; onMaj: (f: Formule) => void }) {
  const [modalOuverte, setModalOuverte] = useState(false);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [dureeMinutes, setDureeMinutes] = useState(60);
  const [prixParPersonne, setPrixParPersonne] = useState(20);
  const [capaciteMax, setCapaciteMax] = useState(12);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const actives = formules.filter((f) => !f.archive);

  async function creer(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim()) return setErreur("Nom requis.");
    setEnvoi(true);
    setErreur(null);
    try {
      const { formule } = await visitesApi.creerFormule({ nom: nom.trim(), description: description.trim() || undefined, dureeMinutes, prixParPersonne, capaciteMax });
      onMaj(formule);
      setModalOuverte(false);
      setNom("");
      setDescription("");
      setDureeMinutes(60);
      setPrixParPersonne(20);
      setCapaciteMax(12);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de la création.");
    } finally {
      setEnvoi(false);
    }
  }

  async function archiver(f: Formule) {
    const { formule } = await visitesApi.modifierFormule(f.id, { archive: true });
    onMaj(formule);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white/85">Formules de visite</p>
        <button
          onClick={() => setModalOuverte(true)}
          className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15"
        >
          <Plus className="size-3.5" /> Nouvelle formule
        </button>
      </div>

      {actives.length === 0 ? (
        <GlassEmptyState icon={Wine} title="Aucune formule" description="Créez votre première formule de visite (durée, prix, jauge)." />
      ) : (
        <div className="flex flex-col gap-1">
          {actives.map((f) => (
            <div key={f.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5">
              <div className="min-w-0">
                <p className="truncate text-sm text-white">{f.nom}</p>
                {f.description && <p className="truncate text-xs text-white/55">{f.description}</p>}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/55">
                <span>{f.duree_minutes} min</span>
                <span>{f.prix_par_personne} € / pers.</span>
                <span>Jauge {f.capacite_max}</span>
                <button onClick={() => archiver(f)} aria-label="Archiver" className="flex size-6 items-center justify-center rounded-full border border-white/15 text-white/50 hover:text-white">
                  <Archive className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <GlassModal open={modalOuverte} onClose={() => setModalOuverte(false)} title="Nouvelle formule">
        <form onSubmit={creer} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-white/55">Nom</label>
            <input value={nom} onChange={(e) => setNom(e.target.value)} className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/55">Description (facultatif)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/30" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-white/55">Durée (min)</label>
              <input type="number" min={1} value={dureeMinutes} onChange={(e) => setDureeMinutes(Number(e.target.value))} className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30" />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-white/55">Prix / pers. (€)</label>
              <input type="number" min={0} step="any" value={prixParPersonne} onChange={(e) => setPrixParPersonne(Number(e.target.value))} className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30" />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-white/55">Jauge max</label>
              <input type="number" min={1} value={capaciteMax} onChange={(e) => setCapaciteMax(Number(e.target.value))} className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30" />
            </div>
          </div>
          {erreur && <p className="text-xs text-red-300">{erreur}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOuverte(false)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
              Annuler
            </button>
            <button type="submit" disabled={envoi} className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50">
              {envoi ? "Création…" : "Créer la formule"}
            </button>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
