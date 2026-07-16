"use client";

import { useState } from "react";
import { Plus, Wine, Pencil, Archive } from "lucide-react";
import { GlassEmptyState } from "@/components/glass/glass-empty-state";
import { GlassModal } from "@/components/glass/glass-modal";
import { GlassContextMenu } from "@/components/glass/glass-context-menu";
import { visitesApi, type Formule, type ModeTarification } from "@/lib/visites-api";

type Brouillon = {
  nom: string;
  description: string;
  dureeMinutes: number;
  modeTarification: ModeTarification;
  prixParPersonne: number;
  prixTotal: number;
  capaciteMax: number;
};

const BROUILLON_VIDE: Brouillon = { nom: "", description: "", dureeMinutes: 60, modeTarification: "par_personne", prixParPersonne: 20, prixTotal: 100, capaciteMax: 12 };

const LABELS_MODE: Record<ModeTarification, string> = { gratuit: "Gratuit", total: "Paiement total", par_personne: "Par personne" };

// Prix affiché sur la carte — reflète le mode choisi, jamais un simple
// "X € / pers." indépendamment de la tarification réelle (correctif V2).
function libellePrix(f: Formule): string {
  if (f.mode_tarification === "gratuit") return "Gratuit";
  if (f.mode_tarification === "total") return `${f.prix_total ?? 0} € / total`;
  return `${f.prix_par_personne} € / pers.`;
}

export function FormulesGlass({ formules, onMaj }: { formules: Formule[]; onMaj: (f: Formule) => void }) {
  const [modalOuverte, setModalOuverte] = useState(false);
  const [enEdition, setEnEdition] = useState<Formule | null>(null);
  const [brouillon, setBrouillon] = useState<Brouillon>(BROUILLON_VIDE);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const actives = formules.filter((f) => !f.archive);

  function ouvrirCreation() {
    setEnEdition(null);
    setBrouillon(BROUILLON_VIDE);
    setErreur(null);
    setModalOuverte(true);
  }

  function ouvrirEdition(f: Formule) {
    setEnEdition(f);
    setBrouillon({
      nom: f.nom,
      description: f.description ?? "",
      dureeMinutes: f.duree_minutes,
      modeTarification: f.mode_tarification,
      prixParPersonne: f.prix_par_personne || 20,
      prixTotal: f.prix_total ?? 100,
      capaciteMax: f.capacite_max,
    });
    setErreur(null);
    setModalOuverte(true);
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    if (!brouillon.nom.trim()) return setErreur("Nom requis.");
    setEnvoi(true);
    setErreur(null);
    try {
      const payload = {
        nom: brouillon.nom.trim(),
        description: brouillon.description.trim() || undefined,
        dureeMinutes: brouillon.dureeMinutes,
        modeTarification: brouillon.modeTarification,
        prixParPersonne: brouillon.prixParPersonne,
        prixTotal: brouillon.prixTotal,
        capaciteMax: brouillon.capaciteMax,
      };
      const { formule } = enEdition ? await visitesApi.modifierFormule(enEdition.id, payload) : await visitesApi.creerFormule(payload);
      onMaj(formule);
      setModalOuverte(false);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de l'enregistrement.");
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
          onClick={ouvrirCreation}
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
            <div
              key={f.id}
              role="button"
              tabIndex={0}
              onClick={() => ouvrirEdition(f)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  ouvrirEdition(f);
                }
              }}
              className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-white">{f.nom}</p>
                {f.description && <p className="truncate text-xs text-white/55">{f.description}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-x-4 gap-y-1 text-xs text-white/55">
                <span>{f.duree_minutes} min</span>
                <span>{libellePrix(f)}</span>
                <span>Jauge {f.capacite_max}</span>
                <GlassContextMenu
                  items={[
                    { label: "Modifier", icon: Pencil, onSelect: () => ouvrirEdition(f) },
                    { label: "Archiver", icon: Archive, onSelect: () => archiver(f), destructive: true },
                  ]}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <GlassModal open={modalOuverte} onClose={() => setModalOuverte(false)} title={enEdition ? "Modifier la formule" : "Nouvelle formule"}>
        <form onSubmit={soumettre} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-white/55">Nom</label>
            <input
              value={brouillon.nom}
              onChange={(e) => setBrouillon((b) => ({ ...b, nom: e.target.value }))}
              className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/55">Description (facultatif)</label>
            <textarea
              value={brouillon.description}
              onChange={(e) => setBrouillon((b) => ({ ...b, description: e.target.value }))}
              rows={2}
              className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-white/55">Durée (min)</label>
              <input
                type="number"
                min={1}
                value={brouillon.dureeMinutes}
                onChange={(e) => setBrouillon((b) => ({ ...b, dureeMinutes: Number(e.target.value) }))}
                className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-white/55">Jauge max</label>
              <input
                type="number"
                min={1}
                value={brouillon.capaciteMax}
                onChange={(e) => setBrouillon((b) => ({ ...b, capaciteMax: Number(e.target.value) }))}
                className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/55">Tarification</label>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(LABELS_MODE) as ModeTarification[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setBrouillon((b) => ({ ...b, modeTarification: mode }))}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${brouillon.modeTarification === mode ? "border-gold/40 bg-gold/20 text-gold" : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"}`}
                >
                  {LABELS_MODE[mode]}
                </button>
              ))}
            </div>
          </div>

          {brouillon.modeTarification === "par_personne" && (
            <div>
              <label className="mb-1 block text-xs text-white/55">Prix / pers. (€)</label>
              <input
                type="number"
                min={0}
                step="any"
                value={brouillon.prixParPersonne}
                onChange={(e) => setBrouillon((b) => ({ ...b, prixParPersonne: Number(e.target.value) }))}
                className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
              />
            </div>
          )}
          {brouillon.modeTarification === "total" && (
            <div>
              <label className="mb-1 block text-xs text-white/55">Prix total du créneau (€)</label>
              <input
                type="number"
                min={0}
                step="any"
                value={brouillon.prixTotal}
                onChange={(e) => setBrouillon((b) => ({ ...b, prixTotal: Number(e.target.value) }))}
                className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
              />
            </div>
          )}
          {brouillon.modeTarification === "gratuit" && <p className="text-xs text-white/50">Aucun paiement ne sera demandé pour cette formule.</p>}

          {erreur && <p className="text-xs text-red-300">{erreur}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOuverte(false)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
              Annuler
            </button>
            <button type="submit" disabled={envoi} className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50">
              {envoi ? "…" : enEdition ? "Enregistrer" : "Créer la formule"}
            </button>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
