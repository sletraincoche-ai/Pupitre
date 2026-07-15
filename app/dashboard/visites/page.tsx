"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { GlassPageShell } from "@/components/glass/glass-page-shell";
import { GlassPanel } from "@/components/glass/glass-panel";
import { GlassModal } from "@/components/glass/glass-modal";
import { AccueilJourGlass } from "@/components/visites/accueil-jour-glass";
import { NouvelleVisiteFormGlass } from "@/components/visites/nouvelle-visite-form-glass";
import { FormulesGlass } from "@/components/visites/formules-glass";
import { CreneauxGlass } from "@/components/visites/creneaux-glass";
import { LienReservationGlass } from "@/components/visites/lien-reservation-glass";
import { QuickSaleModal, type CibleVenteVisite } from "@/components/visites/quick-sale-modal";
import { visitesApi, type Formule, type Creneau, type Reservation } from "@/lib/visites-api";

type Onglet = "accueil" | "configuration";

function aujourdhui(): string {
  return new Date().toISOString().slice(0, 10);
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
export default function VisitesPage() {
  const [onglet, setOnglet] = useState<Onglet>("accueil");
  const [date, setDate] = useState(aujourdhui());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [formules, setFormules] = useState<Formule[]>([]);
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [chargement, setChargement] = useState(true);
  const [modalNouvelleVisite, setModalNouvelleVisite] = useState(false);
  const [cibleVente, setCibleVente] = useState<CibleVenteVisite | null>(null);

  async function rafraichirReservations(pourDate: string) {
    const { reservations } = await visitesApi.listerReservations(pourDate);
    setReservations(reservations);
  }

  async function rafraichirTout() {
    const [r, f, c] = await Promise.all([visitesApi.listerReservations(date), visitesApi.listerFormules(), visitesApi.listerCreneaux()]);
    setReservations(r.reservations);
    setFormules(f.formules);
    setCreneaux(c.creneaux);
  }

  useEffect(() => {
    rafraichirTout().finally(() => setChargement(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!chargement) rafraichirReservations(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  function majReservation(r: Reservation) {
    setReservations((prev) => prev.map((x) => (x.id === r.id ? { ...x, ...r } : x)));
  }

  if (chargement) return null;

  return (
    <GlassPageShell>
      <div className="flex flex-col gap-4 pb-10">
        <GlassPanel intensity="strong" className="shrink-0 px-4 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-semibold tracking-tight text-white">Visites</p>
              <p className="truncate text-xs text-white/70">Accueil du jour, réservation en ligne — connecté à Cave, Clients et Agenda.</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <div className="flex rounded-full border border-white/15 bg-white/5 p-0.5">
                {(["accueil", "configuration"] as Onglet[]).map((o) => (
                  <button
                    key={o}
                    onClick={() => setOnglet(o)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${onglet === o ? "bg-gold/20 text-gold" : "text-white/60 hover:text-white"}`}
                  >
                    {o === "accueil" ? "Accueil du jour" : "Configuration"}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setModalNouvelleVisite(true)}
                className="flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-xs font-medium text-ink hover:bg-gold/90"
              >
                <Plus className="size-3.5" />
                Nouveau visiteur
              </button>
            </div>
          </div>
        </GlassPanel>

        {onglet === "accueil" ? (
          <GlassPanel intensity="regular" className="p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-white/85">
                {new Date(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <div className="flex gap-1.5">
                <button onClick={() => setDate(aujourdhui())} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 hover:bg-white/10">
                  Aujourd&apos;hui
                </button>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white outline-none"
                />
              </div>
            </div>
            <AccueilJourGlass reservations={reservations} onMaj={majReservation} onOuvrirVente={setCibleVente} />
          </GlassPanel>
        ) : (
          <div className="flex flex-col gap-4">
            <GlassPanel intensity="regular" className="p-4">
              <FormulesGlass formules={formules} onMaj={(f) => setFormules((prev) => (prev.some((x) => x.id === f.id) ? prev.map((x) => (x.id === f.id ? f : x)) : [...prev, f]))} />
            </GlassPanel>
            <GlassPanel intensity="regular" className="p-4">
              <CreneauxGlass
                creneaux={creneaux}
                formules={formules.filter((f) => !f.archive)}
                onCree={(c) => setCreneaux((prev) => [...prev, c])}
                onSupprime={(id) => setCreneaux((prev) => prev.filter((c) => c.id !== id))}
              />
            </GlassPanel>
            <GlassPanel intensity="regular" className="p-4">
              <LienReservationGlass />
            </GlassPanel>
          </div>
        )}
      </div>

      <GlassModal open={modalNouvelleVisite} onClose={() => setModalNouvelleVisite(false)} title="Nouveau visiteur">
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
