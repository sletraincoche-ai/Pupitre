"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categorieColors, categorieLabels } from "@/lib/agenda";
import { cn } from "@/lib/utils";

export type VueAgenda = "jour" | "semaine" | "mois";

function getDebutSemaine(date: Date) {
  const jourSemaine = (date.getDay() + 6) % 7;
  const debut = new Date(date);
  debut.setDate(date.getDate() - jourSemaine);
  return debut;
}

function periodeLabel(vue: VueAgenda, curseur: Date) {
  if (vue === "mois") {
    const label = curseur.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
  if (vue === "jour") {
    const label = curseur.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
  const debut = getDebutSemaine(curseur);
  const fin = new Date(debut);
  fin.setDate(debut.getDate() + 6);
  return `${debut.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} – ${fin.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;
}

export function AgendaHeader({
  vue,
  onChangeVue,
  curseur,
  onPrev,
  onNext,
  onAujourdhui,
  onAjouter,
}: {
  vue: VueAgenda;
  onChangeVue: (v: VueAgenda) => void;
  curseur: Date;
  onPrev: () => void;
  onNext: () => void;
  onAujourdhui: () => void;
  onAjouter: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            aria-label="Période précédente"
            className="flex size-8 items-center justify-center rounded-md text-stone hover:bg-muted"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={onNext}
            aria-label="Période suivante"
            className="flex size-8 items-center justify-center rounded-md text-stone hover:bg-muted"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <p className="font-heading text-xl text-ink capitalize">{periodeLabel(vue, curseur)}</p>

        <Button variant="outline" size="sm" onClick={onAujourdhui}>
          Aujourd&apos;hui
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex rounded-lg border border-border/70 bg-card p-0.5">
            {(["jour", "semaine", "mois"] as const).map((v) => (
              <button
                key={v}
                onClick={() => onChangeVue(v)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                  vue === v ? "bg-vine text-white" : "text-stone hover:text-ink"
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <Button className="bg-gold text-white hover:bg-gold/90" onClick={onAjouter}>
            <Plus className="size-4" />
            Ajouter
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-stone">
        {Object.entries(categorieLabels).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: categorieColors[key as keyof typeof categorieColors] }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
