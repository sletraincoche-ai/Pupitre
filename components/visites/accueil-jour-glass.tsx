"use client";

import { useState } from "react";
import { CalendarClock, CheckCircle2, LogIn, Wine, Euro, X, Users } from "lucide-react";
import { GlassEmptyState } from "@/components/glass/glass-empty-state";
import { GlassModal } from "@/components/glass/glass-modal";
import { visitesApi, type Reservation, type Creneau } from "@/lib/visites-api";
import type { CibleVenteVisite } from "@/components/visites/quick-sale-modal";

const LABELS_STATUT: Record<Reservation["statut"], string> = {
  confirmee: "À venir",
  arrivee: "Arrivé",
  terminee: "Terminée",
  annulee: "Annulée",
  en_attente: "En attente",
  refusee: "Refusée",
};

const COULEURS_STATUT: Record<Reservation["statut"], string> = {
  confirmee: "border-white/15 bg-white/5 text-white/70",
  arrivee: "border-gold/40 bg-gold/20 text-gold",
  terminee: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  annulee: "border-red-400/30 bg-red-400/10 text-red-300",
  en_attente: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  refusee: "border-red-400/30 bg-red-400/10 text-red-300",
};

const LABELS_PAIEMENT: Record<Reservation["statut_paiement"], string> = {
  a_configurer: "Paiement à configurer",
  paye_sur_place: "Payé sur place",
  paye_ligne: "Payé en ligne",
  rembourse: "Remboursé",
};

const LABELS_ORIGINE: Record<Reservation["origine"], string> = {
  en_ligne: "En ligne",
  walk_in: "Walk-in",
  manuel: "Manuel",
};

// "10:00" -> "10h", "10:30" -> "10h30" — plus lisible en un coup d'œil
// que le format HH:MM brut (exigence explicite du brief).
function formatHeure(heure: string): string {
  const [h, m] = heure.split(":");
  const heureNum = String(Number(h));
  return m === "00" ? `${heureNum}h` : `${heureNum}h${m}`;
}

export function AccueilJourGlass({
  reservations,
  creneauxDuJour,
  onMaj,
  onOuvrirVente,
}: {
  reservations: Reservation[];
  // Créneaux du jour sans aucune réservation rattachée — affichés comme
  // "Réservation libre" (créneau ouvert au public, pas encore pris).
  creneauxDuJour: Creneau[];
  onMaj: (reservation: Reservation) => void;
  onOuvrirVente: (cible: CibleVenteVisite) => void;
}) {
  const [aTerminer, setATerminer] = useState<Reservation | null>(null);
  const [noteAnecdote, setNoteAnecdote] = useState("");
  const [aAnnuler, setAAnnuler] = useState<Reservation | null>(null);
  const [motif, setMotif] = useState("");
  const [aPayer, setAPayer] = useState<Reservation | null>(null);
  const [moyenPaiement, setMoyenPaiement] = useState("Carte");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function checkin(r: Reservation) {
    try {
      const { reservation } = await visitesApi.checkin(r.id);
      onMaj(reservation);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec du check-in.");
    }
  }

  async function confirmerTerminer(e: React.FormEvent) {
    e.preventDefault();
    if (!aTerminer) return;
    setEnvoi(true);
    try {
      const { reservation } = await visitesApi.terminer(aTerminer.id, noteAnecdote || undefined);
      onMaj(reservation);
      setATerminer(null);
      setNoteAnecdote("");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec.");
    } finally {
      setEnvoi(false);
    }
  }

  async function confirmerAnnulation(e: React.FormEvent) {
    e.preventDefault();
    if (!aAnnuler) return;
    if (!motif.trim()) return setErreur("Un motif est requis.");
    setEnvoi(true);
    try {
      const { reservation } = await visitesApi.annuler(aAnnuler.id, motif.trim());
      onMaj(reservation);
      setAAnnuler(null);
      setMotif("");
      setErreur(null);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de l'annulation.");
    } finally {
      setEnvoi(false);
    }
  }

  async function confirmerPaiement(e: React.FormEvent) {
    e.preventDefault();
    if (!aPayer) return;
    setEnvoi(true);
    try {
      const { reservation } = await visitesApi.marquerPaye(aPayer.id, moyenPaiement);
      onMaj(reservation);
      setAPayer(null);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec.");
    } finally {
      setEnvoi(false);
    }
  }

  // Les demandes en_attente vivent dans l'onglet "Demandes en ligne", pas
  // ici — le planning du jour ne montre que ce qui est déjà confirmé (ou
  // son historique : terminée/annulée/refusée). Une ligne par réservation
  // affichable, plus une ligne par créneau du jour sans AUCUNE réservation
  // active (y compris en_attente, pour ne pas montrer "libre" un créneau
  // en fait bloqué par une demande en cours) — triées par heure de début.
  type Ligne = { heureDebut: string; reservation: Reservation } | { heureDebut: string; creneauLibre: Creneau };
  const reservationsAffichables = reservations.filter((r) => r.statut !== "en_attente");
  const lignes: Ligne[] = [
    ...reservationsAffichables.map((r) => ({ heureDebut: r.heure_debut, reservation: r })),
    ...creneauxDuJour
      .filter((c) => !reservations.some((r) => r.creneau_id === c.id && !r.annule))
      .map((c) => ({ heureDebut: c.heure_debut, creneauLibre: c })),
  ].sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));

  if (lignes.length === 0) {
    return <GlassEmptyState icon={CalendarClock} title="Aucune visite ce jour" description="Les réservations en ligne, walk-ins et créneaux ouverts apparaîtront ici." />;
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        {lignes.map((ligne) => {
          if ("creneauLibre" in ligne) {
            const c = ligne.creneauLibre;
            return (
              <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-xl px-3 py-2.5 opacity-70 hover:bg-white/5 hover:opacity-100">
                <span className="w-24 shrink-0 font-mono text-sm text-white/70 tabular-nums">
                  {formatHeure(c.heure_debut)}–{formatHeure(c.heure_fin)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white/70 italic">{c.visites_formules?.nom ?? "Formule"} · Réservation libre</p>
                </div>
                <span className="shrink-0 flex items-center gap-1 text-xs text-white/50">
                  <Users className="size-3.5" /> 0/{c.capacite_max} pers.
                </span>
              </div>
            );
          }

          const r = ligne.reservation;
          const venteEnregistree = (r.cave_mouvements?.length ?? 0) > 0;
          const creneauAssocie = creneauxDuJour.find((c) => c.id === r.creneau_id);
          const jauge = creneauAssocie ? `${r.personnes}/${creneauAssocie.capacite_max} pers.` : `${r.personnes} pers.`;
          return (
            <div key={r.id} className={`flex flex-wrap items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 ${r.annule ? "opacity-45" : ""}`}>
              <span className="w-24 shrink-0 font-mono text-sm text-white/70 tabular-nums">
                {formatHeure(r.heure_debut)}–{formatHeure(r.heure_fin)}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm text-white ${r.annule ? "line-through" : ""}`}>
                  {r.visites_formules?.nom ?? "Formule"} · {r.visiteur_nom} · {jauge}
                </p>
                <p className="truncate text-xs text-white/55">
                  {LABELS_ORIGINE[r.origine]} · {LABELS_PAIEMENT[r.statut_paiement]}
                  {venteEnregistree && " · Vente enregistrée"}
                  {r.annule && r.motif_annulation ? ` · ${r.motif_annulation}` : ""}
                  {r.note_anecdote ? ` · "${r.note_anecdote}"` : ""}
                </p>
              </div>

              <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${COULEURS_STATUT[r.statut]}`}>{LABELS_STATUT[r.statut]}</span>

              {!r.annule && (
                <div className="flex shrink-0 items-center gap-1.5">
                  {r.statut === "confirmee" && (
                    <button
                      onClick={() => checkin(r)}
                      className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15"
                    >
                      <LogIn className="size-3.5" /> Check-in
                    </button>
                  )}
                  {(r.statut === "arrivee" || r.statut === "confirmee") && (
                    <button
                      onClick={() => onOuvrirVente({ id: r.id, visiteurNom: r.visiteur_nom, clientId: r.client_id })}
                      className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15"
                    >
                      <Wine className="size-3.5" /> Vente
                    </button>
                  )}
                  {r.statut_paiement === "a_configurer" && (
                    <button
                      onClick={() => {
                        setAPayer(r);
                        setMoyenPaiement("Carte");
                      }}
                      className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15"
                    >
                      <Euro className="size-3.5" /> Marquer payé
                    </button>
                  )}
                  {r.statut === "arrivee" && (
                    <button
                      onClick={() => {
                        setATerminer(r);
                        setNoteAnecdote("");
                      }}
                      className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-400/20"
                    >
                      <CheckCircle2 className="size-3.5" /> Terminer
                    </button>
                  )}
                  {r.statut !== "terminee" && (
                    <button
                      onClick={() => {
                        setAAnnuler(r);
                        setMotif("");
                        setErreur(null);
                      }}
                      aria-label="Annuler cette réservation"
                      className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/50 hover:border-red-400/40 hover:text-red-300"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <GlassModal open={!!aTerminer} onClose={() => setATerminer(null)} title="Terminer la visite">
        <form onSubmit={confirmerTerminer} className="flex flex-col gap-3">
          <p className="text-xs text-white/60">{aTerminer?.visiteur_nom} — une anecdote laissée ici peut alimenter une proposition de contenu Studio IA.</p>
          <textarea
            value={noteAnecdote}
            onChange={(e) => setNoteAnecdote(e.target.value)}
            rows={3}
            placeholder="Ex : le groupe a adoré l'histoire du pressoir, très bon retour…"
            className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/30"
          />
          {erreur && <p className="text-xs text-red-300">{erreur}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setATerminer(null)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
              Retour
            </button>
            <button type="submit" disabled={envoi} className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50">
              {envoi ? "…" : "Terminer la visite"}
            </button>
          </div>
        </form>
      </GlassModal>

      <GlassModal open={!!aAnnuler} onClose={() => setAAnnuler(null)} title="Annuler la réservation">
        <form onSubmit={confirmerAnnulation} className="flex flex-col gap-3">
          <p className="text-xs text-white/60">
            {aAnnuler?.visiteur_nom} — la réservation reste visible, marquée annulée. Elle n&apos;est jamais supprimée.
          </p>
          <div>
            <label className="mb-1 block text-xs text-white/55">Motif (obligatoire)</label>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
              placeholder="Ex : visiteur indisponible, erreur de saisie…"
            />
          </div>
          {erreur && <p className="text-xs text-red-300">{erreur}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setAAnnuler(null)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
              Retour
            </button>
            <button type="submit" disabled={envoi} className="rounded-full bg-red-500/80 px-5 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50">
              {envoi ? "Annulation…" : "Confirmer l'annulation"}
            </button>
          </div>
        </form>
      </GlassModal>

      <GlassModal open={!!aPayer} onClose={() => setAPayer(null)} title="Marquer comme payé">
        <form onSubmit={confirmerPaiement} className="flex flex-col gap-3">
          <p className="text-xs text-white/60">{aPayer?.visiteur_nom} — règlement sur place (paiement en ligne pas encore disponible).</p>
          <div className="flex flex-wrap gap-1.5">
            {["Carte", "Espèces", "Chèque"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMoyenPaiement(m)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${moyenPaiement === m ? "border-gold/40 bg-gold/20 text-gold" : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"}`}
              >
                {m}
              </button>
            ))}
          </div>
          {erreur && <p className="text-xs text-red-300">{erreur}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setAPayer(null)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
              Retour
            </button>
            <button type="submit" disabled={envoi} className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50">
              {envoi ? "…" : "Confirmer"}
            </button>
          </div>
        </form>
      </GlassModal>
    </>
  );
}
