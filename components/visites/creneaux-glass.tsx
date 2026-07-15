"use client";

import { useState } from "react";
import { Plus, Trash2, CalendarPlus } from "lucide-react";
import { GlassEmptyState } from "@/components/glass/glass-empty-state";
import { GlassModal } from "@/components/glass/glass-modal";
import { visitesApi, type Creneau, type Formule } from "@/lib/visites-api";

export function CreneauxGlass({ creneaux, formules, onCree, onSupprime }: { creneaux: Creneau[]; formules: Formule[]; onCree: (c: Creneau) => void; onSupprime: (id: string) => void }) {
  const [modalOuverte, setModalOuverte] = useState(false);
  const [formuleId, setFormuleId] = useState(formules[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("10:00");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function creer(e: React.FormEvent) {
    e.preventDefault();
    if (!formuleId || !date || !heure) return setErreur("Formule, date et heure requises.");
    setEnvoi(true);
    setErreur(null);
    try {
      const { creneau } = await visitesApi.creerCreneau({ formuleId, date, heure });
      onCree(creneau);
      setModalOuverte(false);
      setDate("");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de la création.");
    } finally {
      setEnvoi(false);
    }
  }

  async function supprimer(id: string) {
    await visitesApi.supprimerCreneau(id);
    onSupprime(id);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white/85">Créneaux ouverts</p>
        <button
          onClick={() => setModalOuverte(true)}
          disabled={formules.length === 0}
          className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15 disabled:opacity-40"
        >
          <Plus className="size-3.5" /> Ouvrir un créneau
        </button>
      </div>

      {creneaux.length === 0 ? (
        <GlassEmptyState icon={CalendarPlus} title="Aucun créneau ouvert" description="Ouvrez des créneaux pour que les visiteurs puissent réserver en ligne." />
      ) : (
        <div className="flex flex-col gap-1">
          {creneaux.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5">
              <p className="text-sm text-white">
                {new Date(c.date).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit" })} à {c.heure} — {c.visites_formules?.nom ?? "Formule"}
              </p>
              <div className="flex shrink-0 items-center gap-3 text-xs text-white/55">
                <span>
                  {c.reservees}/{c.capacite_max} pers.
                </span>
                <button onClick={() => supprimer(c.id)} aria-label="Supprimer" className="flex size-6 items-center justify-center rounded-full border border-white/15 text-white/50 hover:border-red-400/40 hover:text-red-300">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <GlassModal open={modalOuverte} onClose={() => setModalOuverte(false)} title="Ouvrir un créneau">
        <form onSubmit={creer} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-white/55">Formule</label>
            <div className="flex flex-wrap gap-1.5">
              {formules.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormuleId(f.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${formuleId === f.id ? "border-gold/40 bg-gold/20 text-gold" : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"}`}
                >
                  {f.nom}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-white/55">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30" />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-white/55">Heure</label>
              <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30" />
            </div>
          </div>
          {erreur && <p className="text-xs text-red-300">{erreur}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOuverte(false)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
              Annuler
            </button>
            <button type="submit" disabled={envoi} className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50">
              {envoi ? "Création…" : "Ouvrir le créneau"}
            </button>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
