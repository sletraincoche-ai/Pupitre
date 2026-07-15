"use client";

import { useState } from "react";
import { CalendarClock, CheckCircle2, LogIn, Wine, Euro, X } from "lucide-react";
import { GlassEmptyState } from "@/components/glass/glass-empty-state";
import { GlassModal } from "@/components/glass/glass-modal";
import { visitesApi, type Reservation } from "@/lib/visites-api";
import type { CibleVenteVisite } from "@/components/visites/quick-sale-modal";

const LABELS_STATUT: Record<Reservation["statut"], string> = {
  confirmee: "À venir",
  arrivee: "Arrivé",
  terminee: "Terminée",
  annulee: "Annulée",
};

const COULEURS_STATUT: Record<Reservation["statut"], string> = {
  confirmee: "border-white/15 bg-white/5 text-white/70",
  arrivee: "border-gold/40 bg-gold/20 text-gold",
  terminee: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  annulee: "border-red-400/30 bg-red-400/10 text-red-300",
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

export function AccueilJourGlass({
  reservations,
  onMaj,
  onOuvrirVente,
}: {
  reservations: Reservation[];
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

  if (reservations.length === 0) {
    return <GlassEmptyState icon={CalendarClock} title="Aucune visite ce jour" description="Les réservations en ligne et les walk-ins apparaîtront ici." />;
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        {reservations.map((r) => {
          const venteEnregistree = (r.cave_mouvements?.length ?? 0) > 0;
          return (
            <div key={r.id} className={`flex flex-wrap items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 ${r.annule ? "opacity-45" : ""}`}>
              <span className="w-14 shrink-0 font-mono text-sm text-white/70 tabular-nums">{r.heure}</span>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm text-white ${r.annule ? "line-through" : ""}`}>
                  {r.visiteur_nom} — {r.visites_formules?.nom ?? "Formule"} ({r.personnes} pers.)
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
