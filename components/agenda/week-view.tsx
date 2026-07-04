"use client";

import { toDateKey } from "@/lib/cave";
import { categorieColors, categorieLabels, type AgendaEvent } from "@/lib/agenda";
import { cn } from "@/lib/utils";

function getDebutSemaine(date: Date) {
  const jourSemaine = (date.getDay() + 6) % 7; // 0 = lundi
  const debut = new Date(date);
  debut.setDate(date.getDate() - jourSemaine);
  return debut;
}

function eventLabel(event: AgendaEvent): string {
  if (event.categorie === "visites") return event.visite.client;
  if (event.categorie === "publications") return event.titre;
  return event.titre;
}

export function WeekView({
  curseur,
  aujourdhui,
  events,
  onSelectDay,
}: {
  curseur: Date;
  aujourdhui: Date;
  events: AgendaEvent[];
  onSelectDay: (dateKey: string) => void;
}) {
  const debut = getDebutSemaine(curseur);
  const aujourdhuiKey = toDateKey(aujourdhui);
  const jours = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(debut);
    d.setDate(debut.getDate() + i);
    return d;
  });

  const eventsParJour = new Map<string, AgendaEvent[]>();
  for (const event of events) {
    if (!eventsParJour.has(event.date)) eventsParJour.set(event.date, []);
    eventsParJour.get(event.date)!.push(event);
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
      {jours.map((jour) => {
        const dateKey = toDateKey(jour);
        const dayEvents = eventsParJour.get(dateKey) ?? [];
        const estAujourdhui = dateKey === aujourdhuiKey;

        return (
          <button
            key={dateKey}
            onClick={() => onSelectDay(dateKey)}
            className={cn(
              "flex min-h-32 flex-col gap-2 rounded-lg border p-2.5 text-left transition-colors hover:border-gold/50 hover:bg-gold/5",
              estAujourdhui ? "border-gold bg-gold/5" : "border-border/60 bg-background"
            )}
          >
            <p className={cn("text-xs font-medium", estAujourdhui ? "text-gold" : "text-stone")}>
              {jour.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })}
            </p>
            <div className="flex flex-col gap-1">
              {dayEvents.slice(0, 4).map((event) => (
                <span
                  key={event.id}
                  title={categorieLabels[event.categorie]}
                  className="truncate rounded px-1.5 py-0.5 text-[0.7rem] text-white"
                  style={{ backgroundColor: categorieColors[event.categorie] }}
                >
                  {eventLabel(event)}
                </span>
              ))}
              {dayEvents.length > 4 && (
                <span className="text-[0.7rem] text-stone">+{dayEvents.length - 4} de plus</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
