"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const joursSemaine = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const moisLabel = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function buildCellules(annee: number, mois: number) {
  const totalJours = new Date(annee, mois + 1, 0).getDate();
  const premierJourSemaine = new Date(annee, mois, 1).getDay(); // 0 = dimanche
  const decalage = (premierJourSemaine + 6) % 7; // 0 = lundi

  const cellules: (number | null)[] = Array(decalage).fill(null);
  for (let jour = 1; jour <= totalJours; jour++) cellules.push(jour);
  while (cellules.length % 7 !== 0) cellules.push(null);
  return cellules;
}

function memeJour(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Calendrier mensuel Liquid Glass, dans le même esprit que la grille
// d'Agenda (components/agenda/month-view.tsx) mais dédié à la sélection
// d'une seule date, sans dépendance à react-day-picker.
export function GlassCalendar({
  selection,
  onSelect,
}: {
  selection: Date;
  onSelect: (date: Date) => void;
}) {
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);
  const [curseur, setCurseur] = useState(new Date(selection.getFullYear(), selection.getMonth(), 1));

  const cellules = buildCellules(curseur.getFullYear(), curseur.getMonth());

  function changerMois(delta: number) {
    setCurseur((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  }

  return (
    <div className="w-full max-w-xs">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => changerMois(-1)}
          aria-label="Mois précédent"
          className="flex size-7 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="text-sm font-medium text-white">
          {moisLabel[curseur.getMonth()]} {curseur.getFullYear()}
        </p>
        <button
          onClick={() => changerMois(1)}
          aria-label="Mois suivant"
          className="flex size-7 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {joursSemaine.map((jour) => (
          <div key={jour} className="pb-1 text-[10px] font-medium text-white/45">
            {jour}
          </div>
        ))}
        {cellules.map((jour, index) => {
          if (!jour) return <div key={index} />;
          const date = new Date(curseur.getFullYear(), curseur.getMonth(), jour);
          const estPasse = date < aujourdhui;
          const estAujourdhui = memeJour(date, aujourdhui);
          const estSelectionne = memeJour(date, selection);

          return (
            <button
              key={index}
              disabled={estPasse}
              onClick={() => onSelect(date)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-full text-xs font-medium transition-colors",
                estSelectionne
                  ? "bg-gold text-white"
                  : estAujourdhui
                    ? "border border-gold/50 text-white"
                    : "text-white/80 hover:bg-white/10",
                estPasse && "cursor-not-allowed text-white/25 hover:bg-transparent"
              )}
            >
              {jour}
            </button>
          );
        })}
      </div>
    </div>
  );
}
