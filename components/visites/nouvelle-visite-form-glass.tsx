"use client";

import { useState } from "react";
import { visitesApi, type Formule, type Reservation } from "@/lib/visites-api";

// Walk-in (visiteur déjà présent, "arrivée" directe) ou saisie manuelle
// (réservation prise par téléphone) — même point d'entrée serveur que la
// réservation en ligne (lib/visites-server.ts:creerReservation), sans
// créneau ni capacité imposée : discrétion de l'accueil.
export function NouvelleVisiteFormGlass({ formules, onCree, onAnnuler }: { formules: Formule[]; onCree: (r: Reservation) => void; onAnnuler: () => void }) {
  const [formuleId, setFormuleId] = useState(formules[0]?.id ?? "");
  const [personnes, setPersonnes] = useState(1);
  const [visiteurNom, setVisiteurNom] = useState("");
  const [visiteurEmail, setVisiteurEmail] = useState("");
  const [visiteurTelephone, setVisiteurTelephone] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    if (!formuleId) return setErreur("Choisissez une formule.");
    if (!visiteurNom.trim()) return setErreur("Nom requis.");

    setEnvoi(true);
    setErreur(null);
    try {
      const { reservation } = await visitesApi.creerReservation({
        formuleId,
        personnes,
        visiteurNom: visiteurNom.trim(),
        visiteurEmail: visiteurEmail.trim() || undefined,
        visiteurTelephone: visiteurTelephone.trim() || undefined,
        origine: "walk_in",
      });
      onCree(reservation);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de la création.");
    } finally {
      setEnvoi(false);
    }
  }

  if (formules.length === 0) {
    return <p className="text-sm text-white/60">Créez d&apos;abord une formule dans l&apos;onglet Configuration.</p>;
  }

  return (
    <form onSubmit={soumettre} className="flex flex-col gap-3">
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
          <label className="mb-1 block text-xs text-white/55">Nom</label>
          <input value={visiteurNom} onChange={(e) => setVisiteurNom(e.target.value)} className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30" />
        </div>
        <div className="w-24">
          <label className="mb-1 block text-xs text-white/55">Pers.</label>
          <input
            type="number"
            min={1}
            value={personnes}
            onChange={(e) => setPersonnes(Number(e.target.value))}
            className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-white/55">Email (facultatif)</label>
          <input value={visiteurEmail} onChange={(e) => setVisiteurEmail(e.target.value)} className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30" />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-white/55">Téléphone (facultatif)</label>
          <input value={visiteurTelephone} onChange={(e) => setVisiteurTelephone(e.target.value)} className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30" />
        </div>
      </div>
      {erreur && <p className="text-xs text-red-300">{erreur}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onAnnuler} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
          Annuler
        </button>
        <button type="submit" disabled={envoi} className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50">
          {envoi ? "Création…" : "Ajouter le visiteur"}
        </button>
      </div>
    </form>
  );
}
