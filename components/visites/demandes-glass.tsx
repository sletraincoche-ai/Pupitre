"use client";

import { useState } from "react";
import { Check, X, Inbox, RotateCw } from "lucide-react";
import { GlassEmptyState } from "@/components/glass/glass-empty-state";
import { GlassModal } from "@/components/glass/glass-modal";
import { visitesApi, type Reservation } from "@/lib/visites-api";
import { formatDateCourte } from "@/lib/date-fr";

// "Demandes en ligne" (V4) — toute réservation publique naît en_attente
// (jamais confirmée directement) ; la place reste bloquée pendant
// l'attente (voir lib/visites-server.ts:getCapaciteRestante, qui ne
// filtre que sur annule=true). Valider -> confirmee (apparaît dans
// Accueil du jour). Refuser -> refusee, libère le créneau, email
// d'excuse automatique. Rafraîchi automatiquement toutes les 30s par le
// parent (page.tsx) tant que cet onglet est ouvert, en plus du bouton
// "Recharger" ci-dessous.
export function DemandesGlass({ demandes, onMaj, onRecharger }: { demandes: Reservation[]; onMaj: (id: string) => void; onRecharger: () => Promise<void> }) {
  const [aRefuser, setARefuser] = useState<Reservation | null>(null);
  const [motif, setMotif] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [rechargement, setRechargement] = useState(false);

  async function recharger() {
    setRechargement(true);
    try {
      await onRecharger();
    } finally {
      setRechargement(false);
    }
  }

  async function valider(r: Reservation) {
    try {
      await visitesApi.validerDemande(r.id);
      onMaj(r.id);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de la validation.");
    }
  }

  async function confirmerRefus(e: React.FormEvent) {
    e.preventDefault();
    if (!aRefuser) return;
    if (!motif.trim()) return setErreur("Un motif est requis.");
    setEnvoi(true);
    setErreur(null);
    try {
      await visitesApi.refuserDemande(aRefuser.id, motif.trim());
      onMaj(aRefuser.id);
      setARefuser(null);
      setMotif("");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec du refus.");
    } finally {
      setEnvoi(false);
    }
  }

  const boutonRecharger = (
    <button
      onClick={recharger}
      disabled={rechargement}
      className="flex items-center gap-1.5 self-end rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15 disabled:opacity-50"
    >
      <RotateCw className={`size-3.5 ${rechargement ? "animate-spin" : ""}`} />
      Recharger
    </button>
  );

  if (demandes.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        {boutonRecharger}
        <GlassEmptyState icon={Inbox} title="Aucune demande en attente" description="Les réservations faites depuis la page publique apparaîtront ici, en attente de votre validation." />
      </div>
    );
  }

  return (
    <>
      <div className="mb-3 flex justify-end">{boutonRecharger}</div>
      <div className="flex flex-col gap-1">
        {demandes.map((d) => (
          <div key={d.id} className="flex flex-wrap items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5">
            <span className="w-24 shrink-0 text-xs text-white/55">
              {formatDateCourte(d.date)}
              <br />
              {d.heure_debut}–{d.heure_fin}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white">
                {d.visites_formules?.nom ?? "Formule"} · {d.visiteur_nom} · {d.personnes} pers.
              </p>
              <p className="truncate text-xs text-white/55">
                {d.visiteur_email ?? d.visiteur_telephone ?? "Aucun contact"}
                {d.relance_envoyee_le ? " · Relance envoyée" : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                onClick={() => valider(d)}
                className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-400/20"
              >
                <Check className="size-3.5" /> Valider
              </button>
              <button
                onClick={() => {
                  setARefuser(d);
                  setMotif("");
                  setErreur(null);
                }}
                className="flex items-center gap-1 rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-400/20"
              >
                <X className="size-3.5" /> Refuser
              </button>
            </div>
          </div>
        ))}
      </div>

      <GlassModal open={!!aRefuser} onClose={() => setARefuser(null)} title="Refuser la demande">
        <form onSubmit={confirmerRefus} className="flex flex-col gap-3">
          <p className="text-xs text-white/60">
            {aRefuser?.visiteur_nom} — le créneau sera libéré et un email d&apos;excuse automatique sera envoyé au visiteur.
          </p>
          <div>
            <label className="mb-1 block text-xs text-white/55">Motif (obligatoire)</label>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
              placeholder="Ex : créneau finalement indisponible, groupe trop nombreux…"
            />
          </div>
          {erreur && <p className="text-xs text-red-300">{erreur}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setARefuser(null)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
              Retour
            </button>
            <button type="submit" disabled={envoi} className="rounded-full bg-red-500/80 px-5 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50">
              {envoi ? "…" : "Confirmer le refus"}
            </button>
          </div>
        </form>
      </GlassModal>
    </>
  );
}
