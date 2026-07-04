"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { AgendaHeader, type VueAgenda } from "@/components/agenda/agenda-header";
import { MonthView } from "@/components/agenda/month-view";
import { WeekView } from "@/components/agenda/week-view";
import { DayEventsList } from "@/components/agenda/day-events-list";
import { DayPanel } from "@/components/agenda/day-panel";
import { PersonnelForm } from "@/components/agenda/personnel-form";
import { AUJOURDHUI } from "@/lib/mock-data";
import { toDateKey } from "@/lib/cave";
import {
  getTousLesEvenements,
  evenementsPersonnelsInitiaux,
  type EvenementPersonnel,
} from "@/lib/agenda";

export default function AgendaPage() {
  const [vue, setVue] = useState<VueAgenda>("mois");
  const [curseur, setCurseur] = useState(new Date(AUJOURDHUI));
  const [personnels, setPersonnels] = useState<EvenementPersonnel[]>(
    evenementsPersonnelsInitiaux
  );
  const [caveValidees, setCaveValidees] = useState<Set<string>>(new Set());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const evenements = useMemo(() => getTousLesEvenements(personnels), [personnels]);

  function shift(amount: number) {
    setCurseur((prev) => {
      const next = new Date(prev);
      if (vue === "jour") next.setDate(next.getDate() + amount);
      else if (vue === "semaine") next.setDate(next.getDate() + amount * 7);
      else next.setMonth(next.getMonth() + amount);
      return next;
    });
  }

  function validerCave(id: string) {
    setCaveValidees((prev) => new Set(prev).add(id));
    toast.success("Suggestion validée");
  }

  function supprimerPersonnel(id: string) {
    setPersonnels((prev) => prev.filter((e) => e.id !== id));
    toast.info("Rendez-vous supprimé");
  }

  function ajouterPersonnel(event: EvenementPersonnel) {
    setPersonnels((prev) => [...prev, event]);
    toast.success("Rendez-vous ajouté", { description: event.titre });
  }

  const dateDuJour = toDateKey(curseur);
  const evenementsDuJour = evenements.filter((e) => e.date === dateDuJour);
  const evenementsPanel = selectedDay
    ? evenements.filter((e) => e.date === selectedDay)
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl text-ink">Agenda</h1>
        <p className="mt-1 text-stone">
          Cinq flux qui convergent sans ressaisie — vous n&apos;ajoutez que vos rendez-vous personnels.
        </p>
      </div>

      <Card className="border border-border/70 bg-card shadow-none">
        <CardContent className="px-6">
          <AgendaHeader
            vue={vue}
            onChangeVue={setVue}
            curseur={curseur}
            onPrev={() => shift(-1)}
            onNext={() => shift(1)}
            onAujourdhui={() => setCurseur(new Date(AUJOURDHUI))}
            onAjouter={() => setFormOpen(true)}
          />

          <div className="mt-6">
            {vue === "mois" && (
              <MonthView
                curseur={curseur}
                aujourdhui={AUJOURDHUI}
                events={evenements}
                onSelectDay={setSelectedDay}
              />
            )}
            {vue === "semaine" && (
              <WeekView
                curseur={curseur}
                aujourdhui={AUJOURDHUI}
                events={evenements}
                onSelectDay={setSelectedDay}
              />
            )}
            {vue === "jour" && (
              <DayEventsList
                events={evenementsDuJour}
                caveValidees={caveValidees}
                onValiderCave={validerCave}
                onSupprimerPersonnel={supprimerPersonnel}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <DayPanel
        dateKey={selectedDay}
        events={evenementsPanel}
        caveValidees={caveValidees}
        onValiderCave={validerCave}
        onSupprimerPersonnel={supprimerPersonnel}
        onClose={() => setSelectedDay(null)}
      />

      <PersonnelForm
        open={formOpen}
        defaultDate={curseur}
        onClose={() => setFormOpen(false)}
        onSubmit={ajouterPersonnel}
      />
    </div>
  );
}
