"use client";

import { toDateKey } from "@/lib/cave";
import { categorieColors, type AgendaEvent } from "@/lib/agenda";
import { cn } from "@/lib/utils";

const joursSemaine = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function buildCellules(curseur: Date) {
  const annee = curseur.getFullYear();
  const mois = curseur.getMonth();
  const totalJours = new Date(annee, mois + 1, 0).getDate();
  const premierJourSemaine = new Date(annee, mois, 1).getDay(); // 0 = dimanche
  const decalage = (premierJourSemaine + 6) % 7; // 0 = lundi

  const cellules: (number | null)[] = Array(decalage).fill(null);
  for (let jour = 1; jour <= totalJours; jour++) cellules.push(jour);
  while (cellules.length % 7 !== 0) cellules.push(null);
  return cellules;
}

export function MonthView({
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
  const cellules = buildCellules(curseur);
  const annee = curseur.getFullYear();
  const mois = curseur.getMonth();
  const aujourdhuiKey = toDateKey(aujourdhui);

  const categoriesParJour = new Map<string, Set<AgendaEvent["categorie"]>>();
  for (const event of events) {
    if (!categoriesParJour.has(event.date)) categoriesParJour.set(event.date, new Set());
    categoriesParJour.get(event.date)!.add(event.categorie);
  }

  return (
    <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-stone">
      {joursSemaine.map((jour) => (
        <div key={jour} className="pb-1 font-medium">
          {jour}
        </div>
      ))}
      {cellules.map((jour, index) => {
        if (!jour) return <div key={index} />;
        const dateKey = `${annee}-${String(mois + 1).padStart(2, "0")}-${String(jour).padStart(2, "0")}`;
        const categories = Array.from(categoriesParJour.get(dateKey) ?? []);
        const estAujourdhui = dateKey === aujourdhuiKey;

        return (
          <button
            key={index}
            onClick={() => onSelectDay(dateKey)}
            className={cn(
              "flex aspect-square flex-col items-center gap-1 rounded-lg border p-1.5 transition-colors hover:border-gold/50 hover:bg-gold/5",
              estAujourdhui ? "border-gold bg-gold/5" : "border-border/60 bg-background"
            )}
          >
            <span className={cn("text-sm", estAujourdhui ? "font-semibold text-gold" : "text-ink")}>
              {jour}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-0.5">
              {categories.slice(0, 5).map((cat) => (
                <span
                  key={cat}
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: categorieColors[cat] }}
                />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
