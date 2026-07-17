"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, CalendarPlus, CalendarOff, Repeat } from "lucide-react";
import { GlassEmptyState } from "@/components/glass/glass-empty-state";
import { GlassModal } from "@/components/glass/glass-modal";
import { GlassCalendar } from "@/components/glass/glass-calendar";
import { GlassContextMenu } from "@/components/glass/glass-context-menu";
import { visitesApi, type Creneau, type Formule, type DisponibiliteRecurrente, type ExceptionDisponibilite } from "@/lib/visites-api";
import { JOURS_SEMAINE_ISO, formatDateCourte, versDateISO } from "@/lib/date-fr";

// "Mes disponibilités" (V3) — deux actions strictement séparées : un
// créneau ponctuel (une date précise) et une disponibilité récurrente
// (règle hebdomadaire, jamais matérialisée à l'avance — voir
// lib/visites-server.ts:resoudreCreneauPourReservation). Ni l'une ni
// l'autre ne rattache de nom : c'est le rôle de "Nouvelle visite".
export function DisponibilitesGlass({
  creneaux,
  formules,
  disponibilites,
  onCreneauCree,
  onCreneauSupprime,
  onDisponibiliteCreee,
  onDisponibiliteMaj,
}: {
  creneaux: Creneau[];
  formules: Formule[];
  disponibilites: DisponibiliteRecurrente[];
  onCreneauCree: (c: Creneau) => void;
  onCreneauSupprime: (id: string) => void;
  onDisponibiliteCreee: (d: DisponibiliteRecurrente) => void;
  onDisponibiliteMaj: (d: DisponibiliteRecurrente) => void;
}) {
  const [modalPonctuel, setModalPonctuel] = useState(false);
  const [modalRecurrente, setModalRecurrente] = useState(false);
  const [exceptionPour, setExceptionPour] = useState<DisponibiliteRecurrente | null>(null);

  const creneauxPonctuels = creneaux.filter((c) => !c.disponibilite_id);
  const disponibilitesActives = disponibilites.filter((d) => d.actif);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/85">Créneaux ponctuels</p>
            <p className="text-xs text-white/55">Une date précise, ouverte à la réservation en ligne tant que personne n&apos;a réservé dessus.</p>
          </div>
          <button
            onClick={() => setModalPonctuel(true)}
            disabled={formules.length === 0}
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15 disabled:opacity-40"
          >
            <Plus className="size-3.5" /> Créneau ponctuel
          </button>
        </div>

        {creneauxPonctuels.length === 0 ? (
          <GlassEmptyState icon={CalendarPlus} title="Aucun créneau ponctuel" description="Ouvrez une date précise pour la réservation en ligne." />
        ) : (
          <div className="flex flex-col gap-1">
            {creneauxPonctuels.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5">
                <p className="text-sm text-white">
                  {formatDateCourte(c.date)} · {c.heure_debut}–{c.heure_fin} — {c.visites_formules?.nom ?? "Formule"}
                </p>
                <div className="flex shrink-0 items-center gap-3 text-xs text-white/55">
                  <span>
                    {c.reservees}/{c.capacite_max} pers.
                  </span>
                  <button
                    onClick={async () => {
                      await visitesApi.supprimerCreneau(c.id);
                      onCreneauSupprime(c.id);
                    }}
                    aria-label="Supprimer"
                    className="flex size-6 items-center justify-center rounded-full border border-white/15 text-white/50 hover:border-red-400/40 hover:text-red-300"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/85">Disponibilités récurrentes</p>
            <p className="text-xs text-white/55">Règle hebdomadaire — génère automatiquement des créneaux ouverts chaque semaine.</p>
          </div>
          <button
            onClick={() => setModalRecurrente(true)}
            disabled={formules.length === 0}
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15 disabled:opacity-40"
          >
            <Plus className="size-3.5" /> Disponibilité récurrente
          </button>
        </div>

        {disponibilitesActives.length === 0 ? (
          <GlassEmptyState icon={Repeat} title="Aucune disponibilité récurrente" description="Ex : tous les lundis 10h-12h — générée automatiquement chaque semaine." />
        ) : (
          <div className="flex flex-col gap-1">
            {disponibilitesActives.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5">
                <p className="text-sm text-white">
                  Tous les {JOURS_SEMAINE_ISO.find((j) => j.valeur === d.jour_semaine)?.label.toLowerCase()} · {d.heure_debut}–{d.heure_fin} — {d.visites_formules?.nom ?? "Formule"}
                </p>
                <div className="flex shrink-0 items-center gap-3 text-xs text-white/55">
                  <span>Jauge {d.capacite_max}</span>
                  <GlassContextMenu
                    items={[
                      { label: "Suspendre une date", icon: CalendarOff, onSelect: () => setExceptionPour(d) },
                      { label: "Désactiver", icon: Trash2, onSelect: () => visitesApi.modifierDisponibiliteRecurrente(d.id, false).then((r) => onDisponibiliteMaj(r.disponibilite)), destructive: true },
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ModalCreneauPonctuel open={modalPonctuel} onClose={() => setModalPonctuel(false)} formules={formules} onCree={onCreneauCree} />
      <ModalDisponibiliteRecurrente open={modalRecurrente} onClose={() => setModalRecurrente(false)} formules={formules} onCree={onDisponibiliteCreee} />
      <ModalExceptions disponibilite={exceptionPour} onClose={() => setExceptionPour(null)} />
    </div>
  );
}

function ModalCreneauPonctuel({ open, onClose, formules, onCree }: { open: boolean; onClose: () => void; formules: Formule[]; onCree: (c: Creneau) => void }) {
  const [formuleId, setFormuleId] = useState(formules[0]?.id ?? "");
  const [date, setDate] = useState(() => new Date());
  const [heureDebut, setHeureDebut] = useState("10:00");
  const [heureFin, setHeureFin] = useState("11:00");
  const [capaciteMax, setCapaciteMax] = useState(12);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFormuleId(formules[0]?.id ?? "");
      setDate(new Date());
      setCapaciteMax(formules[0]?.capacite_max ?? 12);
      setErreur(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    if (!formuleId) return setErreur("Choisissez une formule.");
    setEnvoi(true);
    setErreur(null);
    try {
      const { creneau } = await visitesApi.creerCreneauPonctuel({ formuleId, date: versDateISO(date), heureDebut, heureFin, capaciteMax });
      onCree(creneau);
      onClose();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de la création.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <GlassModal open={open} onClose={onClose} title="Créneau ponctuel">
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
            <input type="time" value={heureFin} onChange={(e) => setHeureFin(e.target.value)} className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white [color-scheme:dark]" />
          </div>
          <div className="w-28">
            <label className="mb-1 block text-xs text-white/55">Jauge</label>
            <input
              type="number"
              min={1}
              value={capaciteMax}
              onChange={(e) => setCapaciteMax(Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
            />
          </div>
        </div>
        {erreur && <p className="text-xs text-red-300">{erreur}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
            Annuler
          </button>
          <button type="submit" disabled={envoi} className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50">
            {envoi ? "Création…" : "Ouvrir le créneau"}
          </button>
        </div>
      </form>
    </GlassModal>
  );
}

function ModalDisponibiliteRecurrente({ open, onClose, formules, onCree }: { open: boolean; onClose: () => void; formules: Formule[]; onCree: (d: DisponibiliteRecurrente) => void }) {
  const [formuleId, setFormuleId] = useState(formules[0]?.id ?? "");
  const [jourSemaine, setJourSemaine] = useState(1);
  const [heureDebut, setHeureDebut] = useState("10:00");
  const [heureFin, setHeureFin] = useState("12:00");
  const [capaciteMax, setCapaciteMax] = useState(12);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFormuleId(formules[0]?.id ?? "");
      setCapaciteMax(formules[0]?.capacite_max ?? 12);
      setErreur(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    if (!formuleId) return setErreur("Choisissez une formule.");
    setEnvoi(true);
    setErreur(null);
    try {
      const { disponibilite } = await visitesApi.creerDisponibiliteRecurrente({ formuleId, jourSemaine, heureDebut, heureFin, capaciteMax });
      onCree(disponibilite);
      onClose();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de la création.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <GlassModal open={open} onClose={onClose} title="Disponibilité récurrente">
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
        <div>
          <label className="mb-1 block text-xs text-white/55">Jour de la semaine</label>
          <div className="flex flex-wrap gap-1.5">
            {JOURS_SEMAINE_ISO.map((j) => (
              <button
                key={j.valeur}
                type="button"
                onClick={() => setJourSemaine(j.valeur)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${jourSemaine === j.valeur ? "border-gold/40 bg-gold/20 text-gold" : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"}`}
              >
                {j.abrege}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="mb-1.5 text-xs font-medium tracking-wide text-white/60 uppercase">Début</p>
            <input type="time" value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)} className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white [color-scheme:dark]" />
          </div>
          <div className="flex-1">
            <p className="mb-1.5 text-xs font-medium tracking-wide text-white/60 uppercase">Fin</p>
            <input type="time" value={heureFin} onChange={(e) => setHeureFin(e.target.value)} className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white [color-scheme:dark]" />
          </div>
          <div className="w-28">
            <label className="mb-1 block text-xs text-white/55">Jauge</label>
            <input
              type="number"
              min={1}
              value={capaciteMax}
              onChange={(e) => setCapaciteMax(Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
            />
          </div>
        </div>
        {erreur && <p className="text-xs text-red-300">{erreur}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
            Annuler
          </button>
          <button type="submit" disabled={envoi} className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50">
            {envoi ? "Création…" : "Créer la règle"}
          </button>
        </div>
      </form>
    </GlassModal>
  );
}

function ModalExceptions({ disponibilite, onClose }: { disponibilite: DisponibiliteRecurrente | null; onClose: () => void }) {
  const [exceptions, setExceptions] = useState<ExceptionDisponibilite[]>([]);
  const [date, setDate] = useState(() => new Date());
  const [motif, setMotif] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (disponibilite) {
      visitesApi.listerExceptions(disponibilite.id).then((r) => setExceptions(r.exceptions));
      setDate(new Date());
      setMotif("");
      setErreur(null);
    }
  }, [disponibilite]);

  async function ajouter(e: React.FormEvent) {
    e.preventDefault();
    if (!disponibilite) return;
    setEnvoi(true);
    setErreur(null);
    try {
      const { exception } = await visitesApi.ajouterException(disponibilite.id, versDateISO(date), motif || undefined);
      setExceptions((prev) => [...prev, exception].sort((a, b) => a.date.localeCompare(b.date)));
      setMotif("");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de l'ajout.");
    } finally {
      setEnvoi(false);
    }
  }

  async function supprimer(id: string) {
    await visitesApi.supprimerException(id);
    setExceptions((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <GlassModal open={!!disponibilite} onClose={onClose} title="Suspendre une date">
      <div className="flex flex-col gap-4">
        <p className="text-xs text-white/60">
          {disponibilite && `Tous les ${JOURS_SEMAINE_ISO.find((j) => j.valeur === disponibilite.jour_semaine)?.label.toLowerCase()} ${disponibilite.heure_debut}–${disponibilite.heure_fin}`} — la règle reste active,
          seule cette date précise sera fermée.
        </p>

        {exceptions.length > 0 && (
          <div className="flex flex-col gap-1">
            {exceptions.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm text-white/80">
                <span>
                  {formatDateCourte(e.date)}
                  {e.motif ? ` — ${e.motif}` : ""}
                </span>
                <button onClick={() => supprimer(e.id)} aria-label="Retirer l'exception" className="text-white/50 hover:text-red-300">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={ajouter} className="flex flex-col gap-3">
          <div className="flex justify-center">
            <GlassCalendar selection={date} onSelect={setDate} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/55">Motif (facultatif)</label>
            <input
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex : absent, jour férié…"
              className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/30"
            />
          </div>
          {erreur && <p className="text-xs text-red-300">{erreur}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
              Fermer
            </button>
            <button type="submit" disabled={envoi} className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50">
              {envoi ? "…" : "Suspendre cette date"}
            </button>
          </div>
        </form>
      </div>
    </GlassModal>
  );
}
