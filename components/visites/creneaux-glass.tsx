"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, CalendarPlus } from "lucide-react";
import { GlassEmptyState } from "@/components/glass/glass-empty-state";
import { GlassModal } from "@/components/glass/glass-modal";
import { GlassCalendar } from "@/components/glass/glass-calendar";
import { visitesApi, type Creneau, type Formule } from "@/lib/visites-api";
import { clientsApi, type Client } from "@/lib/clients-api";

function versDateISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function ajouterMinutes(heure: string, minutes: number): string {
  const [h, m] = heure.split(":").map(Number);
  const total = ((h * 60 + m + minutes) % (24 * 60) + 24 * 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// "Ajouter une visite" (V2) — un seul geste pour ouvrir un créneau et,
// si un nom ou une fiche client est donné, y rattacher immédiatement une
// réservation : réservation prise par téléphone, groupe déjà convenu, ou
// créneau ouvert au public si le nom reste vide (voir
// lib/visites-server.ts:ajouterVisite).
export function CreneauxGlass({ creneaux, formules, onAjoute, onSupprime }: { creneaux: Creneau[]; formules: Formule[]; onAjoute: () => void; onSupprime: (id: string) => void }) {
  const [modalOuverte, setModalOuverte] = useState(false);
  const [formuleId, setFormuleId] = useState(formules[0]?.id ?? "");
  const [date, setDate] = useState(() => new Date());
  const [heureDebut, setHeureDebut] = useState("10:00");
  const [heureFin, setHeureFin] = useState("11:00");
  const [heureFinTouchee, setHeureFinTouchee] = useState(false);
  const [personnes, setPersonnes] = useState(12);
  const [visiteurNom, setVisiteurNom] = useState("");
  const [clientId, setClientId] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (modalOuverte) clientsApi.lister().then((r) => setClients(r.clients));
  }, [modalOuverte]);

  // Heure de fin suggérée automatiquement depuis la durée de la formule
  // choisie, tant que le vigneron ne l'a pas modifiée lui-même.
  useEffect(() => {
    if (heureFinTouchee) return;
    const formule = formules.find((f) => f.id === formuleId);
    if (formule) setHeureFin(ajouterMinutes(heureDebut, formule.duree_minutes));
  }, [formuleId, heureDebut, heureFinTouchee, formules]);

  function ouvrir() {
    setFormuleId(formules[0]?.id ?? "");
    setDate(new Date());
    setHeureDebut("10:00");
    setHeureFinTouchee(false);
    setPersonnes(formules[0]?.capacite_max ?? 12);
    setVisiteurNom("");
    setClientId("");
    setErreur(null);
    setModalOuverte(true);
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    if (!formuleId) return setErreur("Choisissez une formule.");
    if (!Number.isInteger(personnes) || personnes <= 0) return setErreur("Nombre de personnes invalide.");
    setEnvoi(true);
    setErreur(null);
    try {
      await visitesApi.ajouterVisite({
        formuleId,
        date: versDateISO(date),
        heureDebut,
        heureFin,
        personnes,
        visiteurNom: visiteurNom.trim() || undefined,
        clientId: clientId || undefined,
      });
      onAjoute();
      setModalOuverte(false);
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
        <div>
          <p className="text-sm font-medium text-white/85">Créneaux ouverts</p>
          <p className="text-xs text-white/55">Réservation par téléphone, groupe déjà convenu, ou créneau ouvert au public.</p>
        </div>
        <button
          onClick={ouvrir}
          disabled={formules.length === 0}
          className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15 disabled:opacity-40"
        >
          <Plus className="size-3.5" /> Ajouter une visite
        </button>
      </div>

      {creneaux.length === 0 ? (
        <GlassEmptyState icon={CalendarPlus} title="Aucune visite ajoutée" description="Ajoutez une visite pour ouvrir un créneau, avec ou sans visiteur déjà rattaché." />
      ) : (
        <div className="flex flex-col gap-1">
          {creneaux.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5">
              <p className="text-sm text-white">
                {new Date(c.date).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit" })} · {c.heure_debut}–{c.heure_fin} — {c.visites_formules?.nom ?? "Formule"}
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

      <GlassModal open={modalOuverte} onClose={() => setModalOuverte(false)} title="Ajouter une visite">
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
              <input
                type="time"
                value={heureDebut}
                onChange={(e) => setHeureDebut(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white [color-scheme:dark]"
              />
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
            <div className="w-28">
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

          <div>
            <label className="mb-1 block text-xs text-white/55">Nom du visiteur (facultatif — laissez vide pour un créneau ouvert au public)</label>
            <input
              value={visiteurNom}
              onChange={(e) => {
                setVisiteurNom(e.target.value);
                setClientId("");
              }}
              placeholder="Ex : Famille Whitmore, groupe belge…"
              className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/30"
            />
          </div>

          {clients.length > 0 && (
            <div>
              <label className="mb-1 block text-xs text-white/55">Ou rattacher une fiche client existante</label>
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

          {erreur && <p className="text-xs text-red-300">{erreur}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOuverte(false)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
              Annuler
            </button>
            <button type="submit" disabled={envoi} className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50">
              {envoi ? "Création…" : "Ajouter la visite"}
            </button>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
