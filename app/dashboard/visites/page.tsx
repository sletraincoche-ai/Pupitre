"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { GlassPageShell } from "@/components/glass/glass-page-shell";
import { GlassPanel } from "@/components/glass/glass-panel";
import { GlassModal } from "@/components/glass/glass-modal";
import { GlassDatePopover } from "@/components/glass/glass-date-popover";
import { AccueilJourGlass } from "@/components/visites/accueil-jour-glass";
import { NouvelleVisiteFormGlass } from "@/components/visites/nouvelle-visite-form-glass";
import { FormulesGlass } from "@/components/visites/formules-glass";
import { DisponibilitesGlass } from "@/components/visites/disponibilites-glass";
import { DemandesGlass } from "@/components/visites/demandes-glass";
import { LienReservationGlass } from "@/components/visites/lien-reservation-glass";
import { QuickSaleModal, type CibleVenteVisite } from "@/components/visites/quick-sale-modal";
import { visitesApi, type Formule, type Creneau, type Reservation, type DisponibiliteRecurrente } from "@/lib/visites-api";
import { formatDateLongue, versDateISO } from "@/lib/date-fr";

type Onglet = "accueil" | "formules" | "disponibilites" | "demandes";

const LABELS_ONGLET: Record<Onglet, string> = {
  accueil: "Accueil du jour",
  formules: "Formules",
  disponibilites: "Mes disponibilités",
  demandes: "Demandes en ligne",
};

function aujourdhui(): string {
  return versDateISO(new Date());
}

function demain(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return versDateISO(d);
}

// Reconstruction réelle de Visites — remplace l'ancienne simulation
// (lib/mock-data.ts Visite, components/visites/{hero-card,retreat-list,
// confirmation-modal,anecdote-modal,configuration-tab}.tsx, lib/visites.ts).
// lib/mock-data.ts et lib/agenda.ts restent utilisés tels quels par
// Agenda/KPI cards/dashboard shell — hors périmètre de ce chantier, qui
// n'écrit que dans les nouvelles tables visites_* et dans evenements
// (source: "visites"). components/visites/quick-sale-modal.tsx est
// réutilisé tel quel (écriture Cave inchangée), seul son type de prop a
// été adapté pour recevoir une vraie réservation.
//
// V3 — 4 blocs clairs : Formules, Mes disponibilités (créneau ponctuel /
// disponibilité récurrente), Demandes en ligne (validation des
// réservations publiques), Accueil du jour (ce qui est déjà confirmé).
export default function VisitesPage() {
  const [onglet, setOnglet] = useState<Onglet>("accueil");
  const [date, setDate] = useState(aujourdhui());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [formules, setFormules] = useState<Formule[]>([]);
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [disponibilites, setDisponibilites] = useState<DisponibiliteRecurrente[]>([]);
  const [demandes, setDemandes] = useState<Reservation[]>([]);
  const [chargement, setChargement] = useState(true);
  const [modalNouvelleVisite, setModalNouvelleVisite] = useState(false);
  const [cibleVente, setCibleVente] = useState<CibleVenteVisite | null>(null);

  async function rafraichirReservations(pourDate: string) {
    const { reservations } = await visitesApi.listerReservations(pourDate);
    setReservations(reservations);
  }

  async function rafraichirDemandes() {
    const { demandes } = await visitesApi.listerDemandes();
    setDemandes(demandes);
  }

  async function rafraichirTout() {
    const [r, f, c, d, dem] = await Promise.all([
      visitesApi.listerReservations(date),
      visitesApi.listerFormules(),
      visitesApi.listerCreneaux(),
      visitesApi.listerDisponibilitesRecurrentes(),
      visitesApi.listerDemandes(),
    ]);
    setReservations(r.reservations);
    setFormules(f.formules);
    setCreneaux(c.creneaux);
    setDisponibilites(d.disponibilites);
    setDemandes(dem.demandes);
  }

  useEffect(() => {
    rafraichirTout().finally(() => setChargement(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!chargement) rafraichirReservations(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // Rafraîchissement automatique des demandes en ligne toutes les 30s
  // tant que cet onglet est ouvert — en plus du bouton "Recharger", pour
  // ne pas dépendre uniquement d'un geste manuel (brief V4).
  useEffect(() => {
    if (onglet !== "demandes") return;
    const intervalle = setInterval(() => rafraichirDemandes(), 30_000);
    return () => clearInterval(intervalle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onglet]);

  // V5 — un créneau ponctuel passé est archivé côté serveur de façon
  // opportuniste (jamais un cron) : redemander la liste à chaque
  // affichage de l'onglet Disponibilités, pas seulement au chargement
  // initial de la page, pour que l'archivage se déclenche vraiment "à
  // chaque affichage de l'onglet" comme demandé.
  useEffect(() => {
    if (onglet !== "disponibilites" || chargement) return;
    visitesApi.listerCreneaux().then((r) => setCreneaux(r.creneaux));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onglet]);

  function majReservation(r: Reservation) {
    setReservations((prev) => prev.map((x) => (x.id === r.id ? { ...x, ...r } : x)));
  }

  function majDemandeTraitee(id: string) {
    setDemandes((prev) => prev.filter((d) => d.id !== id));
    rafraichirReservations(date);
  }

  if (chargement) return null;

  const estAujourdhui = date === aujourdhui();
  const labelToggle = estAujourdhui ? "Demain" : "Aujourd'hui";
  const creneauxDuJour = creneaux.filter((c) => c.date === date);

  return (
    <GlassPageShell>
      <div className="flex flex-col gap-4 pb-10">
        <GlassPanel intensity="strong" className="shrink-0 px-4 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-semibold tracking-tight text-white">Visites</p>
              <p className="truncate text-xs text-white/70">Formules, disponibilités, demandes en ligne et accueil du jour — connecté à Cave, Clients et Agenda.</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <div className="flex rounded-full border border-white/15 bg-white/5 p-0.5">
                {(Object.keys(LABELS_ONGLET) as Onglet[]).map((o) => (
                  <button
                    key={o}
                    data-tutoriel={o === "demandes" ? "onglet-demandes" : undefined}
                    onClick={() => setOnglet(o)}
                    className={`relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${onglet === o ? "bg-gold/20 text-gold" : "text-white/60 hover:text-white"}`}
                  >
                    {LABELS_ONGLET[o]}
                    {o === "demandes" && demandes.length > 0 && (
                      <span className="ml-1.5 inline-flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">{demandes.length}</span>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setModalNouvelleVisite(true)}
                className="flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-xs font-medium text-ink hover:bg-gold/90"
              >
                <Plus className="size-3.5" />
                Nouvelle visite
              </button>
            </div>
          </div>
        </GlassPanel>

        {onglet === "accueil" && (
          <GlassPanel intensity="regular" className="p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-white/85">
                {formatDateLongue(date)}
                {estAujourdhui && <span className="ml-2 text-xs text-white/50">(aujourd&apos;hui)</span>}
              </p>
              <div className="flex gap-1.5">
                <button onClick={() => setDate(estAujourdhui ? demain() : aujourdhui())} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 hover:bg-white/10">
                  {labelToggle}
                </button>
                <GlassDatePopover date={new Date(`${date}T00:00:00`)} onSelect={(d) => setDate(versDateISO(d))} />
              </div>
            </div>
            <AccueilJourGlass reservations={reservations} creneauxDuJour={creneauxDuJour} onMaj={majReservation} onOuvrirVente={setCibleVente} />
          </GlassPanel>
        )}

        {onglet === "formules" && (
          <GlassPanel intensity="regular" className="p-4">
            <FormulesGlass formules={formules} onMaj={(f) => setFormules((prev) => (prev.some((x) => x.id === f.id) ? prev.map((x) => (x.id === f.id ? f : x)) : [...prev, f]))} />
          </GlassPanel>
        )}

        {onglet === "disponibilites" && (
          <div className="flex flex-col gap-4">
            <GlassPanel intensity="regular" className="p-4">
              <DisponibilitesGlass
                creneaux={creneaux}
                formules={formules.filter((f) => !f.archive)}
                disponibilites={disponibilites}
                onCreneauCree={(c) => setCreneaux((prev) => [...prev, c])}
                onCreneauSupprime={(id) => setCreneaux((prev) => prev.filter((c) => c.id !== id))}
                onDisponibilitesCreees={(nouvelles) => setDisponibilites((prev) => [...prev, ...nouvelles])}
                onDisponibiliteMaj={(d) => setDisponibilites((prev) => prev.map((x) => (x.id === d.id ? d : x)))}
              />
            </GlassPanel>
            <GlassPanel intensity="regular" className="p-4">
              <LienReservationGlass />
            </GlassPanel>
          </div>
        )}

        {onglet === "demandes" && (
          <GlassPanel intensity="regular" className="p-4">
            <DemandesGlass demandes={demandes} onMaj={majDemandeTraitee} onRecharger={rafraichirDemandes} />
          </GlassPanel>
        )}
      </div>

      <GlassModal open={modalNouvelleVisite} onClose={() => setModalNouvelleVisite(false)} title="Nouvelle visite">
        <NouvelleVisiteFormGlass
          formules={formules.filter((f) => !f.archive)}
          onCree={(r) => {
            setModalNouvelleVisite(false);
            if (r.date === date) setReservations((prev) => [...prev, r]);
          }}
          onAnnuler={() => setModalNouvelleVisite(false)}
        />
      </GlassModal>

      <QuickSaleModal visite={cibleVente} onClose={() => setCibleVente(null)} />
    </GlassPageShell>
  );
}
