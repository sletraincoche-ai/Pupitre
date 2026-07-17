"use client";

import { useEffect, useState } from "react";
import { GlassCalendar } from "@/components/glass/glass-calendar";
import { GlassNumberInput } from "@/components/glass/glass-number-input";
import { visitesApi, type Formule, type Reservation } from "@/lib/visites-api";
import { clientsApi, type Client } from "@/lib/clients-api";
import { versDateISO, ajouterMinutes } from "@/lib/date-fr";

// "Nouvelle visite" (V3, remplace "Nouveau visiteur") — le viticulteur
// programme lui-même une visite : confirmée immédiatement, aucune
// validation nécessaire (c'est lui qui l'a créée). Se rattache à une
// disponibilité existante si la date/heure correspond exactement,
// sinon réservation autonome — voir
// lib/visites-server.ts:creerNouvelleVisite.
export function NouvelleVisiteFormGlass({ formules, onCree, onAnnuler }: { formules: Formule[]; onCree: (r: Reservation) => void; onAnnuler: () => void }) {
  const [formuleId, setFormuleId] = useState(formules[0]?.id ?? "");
  const [date, setDate] = useState(() => new Date());
  const [heureDebut, setHeureDebut] = useState(() => new Date().toTimeString().slice(0, 5));
  const [heureFin, setHeureFin] = useState("");
  const [heureFinTouchee, setHeureFinTouchee] = useState(false);
  const [personnes, setPersonnes] = useState(1);
  const [visiteurNom, setVisiteurNom] = useState("");
  const [visiteurEmail, setVisiteurEmail] = useState("");
  const [visiteurTelephone, setVisiteurTelephone] = useState("");
  const [clientId, setClientId] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const formuleChoisie = formules.find((f) => f.id === formuleId);

  useEffect(() => {
    clientsApi.lister().then((r) => setClients(r.clients));
  }, []);

  // Heure de fin auto-remplie dès que la formule (ou l'heure de début)
  // change, calculée depuis la durée pré-configurée de la formule —
  // ajustable manuellement ensuite (dès que l'utilisateur y touche, on
  // arrête de la recalculer automatiquement).
  useEffect(() => {
    if (heureFinTouchee || !formuleChoisie) return;
    setHeureFin(ajouterMinutes(heureDebut, formuleChoisie.duree_minutes));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formuleId, heureDebut, formuleChoisie]);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    if (!formuleId) return setErreur("Choisissez une formule.");

    setEnvoi(true);
    setErreur(null);
    try {
      const { reservation } = await visitesApi.creerNouvelleVisite({
        formuleId,
        date: versDateISO(date),
        heureDebut,
        heureFin: heureFin || undefined,
        personnes,
        visiteurNom: visiteurNom.trim() || undefined,
        visiteurEmail: visiteurEmail.trim() || undefined,
        visiteurTelephone: visiteurTelephone.trim() || undefined,
        clientId: clientId || undefined,
      });
      onCree(reservation);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de la création.");
    } finally {
      setEnvoi(false);
    }
  }

  if (formules.length === 0) {
    return <p className="text-sm text-white/60">Créez d&apos;abord une formule dans l&apos;onglet Formules.</p>;
  }

  return (
    <form onSubmit={soumettre} className="flex flex-col gap-4">
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

      <div className="flex justify-center">
        <GlassCalendar selection={date} onSelect={setDate} />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <p className="mb-1.5 text-xs font-medium tracking-wide text-white/60 uppercase">Début</p>
          <input type="time" value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)} className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white [color-scheme:dark]" />
        </div>
        <div className="flex-1">
          <p className="mb-1.5 text-xs font-medium tracking-wide text-white/60 uppercase">Fin</p>
          <input
            type="time"
            value={heureFin}
            onChange={(e) => {
              setHeureFin(e.target.value);
              setHeureFinTouchee(true);
            }}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white [color-scheme:dark]"
          />
        </div>
        <div className="w-24">
          <label className="mb-1 block text-xs text-white/55">Pers.</label>
          <GlassNumberInput min={1} max={formuleChoisie?.capacite_max} value={personnes} onChange={setPersonnes} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-white/55">Nom du visiteur (facultatif)</label>
        <input
          value={visiteurNom}
          onChange={(e) => {
            setVisiteurNom(e.target.value);
            setClientId("");
          }}
          className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
        />
      </div>

      {clients.length > 0 && (
        <div>
          <label className="mb-1 block text-xs text-white/55">Ou rechercher une fiche client existante</label>
          <select
            value={clientId}
            onChange={(e) => {
              const id = e.target.value;
              setClientId(id);
              const client = clients.find((c) => c.id === id);
              if (client) setVisiteurNom(client.nom);
            }}
            className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
          >
            <option value="" className="bg-ink">
              Aucune (nom libre)
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id} className="bg-ink">
                {c.nom}
              </option>
            ))}
          </select>
        </div>
      )}

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
          {envoi ? "Création…" : "Confirmer la visite"}
        </button>
      </div>
    </form>
  );
}
