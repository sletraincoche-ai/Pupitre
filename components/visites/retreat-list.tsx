"use client";

import { NotebookPen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Mouvement, Visite } from "@/lib/mock-data";
import { estPassee, estTerminee, formatHistorique } from "@/lib/visites";
import { cn } from "@/lib/utils";

const statutStyles: Record<Visite["statut"], string> = {
  Confirmée: "bg-vine/10 text-vine",
  "En attente": "bg-gold/15 text-gold",
  Annulée: "bg-destructive/10 text-destructive",
};

export function RetreatList({
  visites,
  mouvements,
  toutesLesVisites,
  onOuvrirConfirmation,
  onOuvrirAnecdote,
}: {
  visites: Visite[];
  mouvements: Mouvement[];
  toutesLesVisites: Visite[];
  onOuvrirConfirmation: (visite: Visite) => void;
  onOuvrirAnecdote: (visite: Visite) => void;
}) {
  if (visites.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/70 py-8 text-center text-sm text-stone">
        Aucune autre visite pour le moment.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 opacity-70">
      {visites.map((visite) => {
        const passee = estPassee(visite);
        const terminee = passee && estTerminee(visite, mouvements);
        const cliquable = visite.statut === "Confirmée";

        return (
          <div
            key={visite.id}
            onClick={() => cliquable && onOuvrirConfirmation(visite)}
            className={cn(
              "flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-border/60 bg-card px-4 py-3 text-sm",
              cliquable && "cursor-pointer hover:opacity-100 hover:border-gold/40"
            )}
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">
                {visite.date} · {visite.heure} — {visite.client}
              </p>
              <p className="mt-0.5 text-xs text-stone">
                {visite.formule} · {visite.personnes} pers. · {visite.langue} ·{" "}
                {formatHistorique(visite, mouvements, toutesLesVisites)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {terminee && (
                <>
                  <Badge variant="outline" className="border-transparent bg-vine/10 text-vine">
                    Terminée
                  </Badge>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOuvrirAnecdote(visite);
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-gold hover:underline"
                  >
                    <NotebookPen className="size-3.5" />
                    {visite.noteAnecdote ? "Voir la note" : "Ajouter une note"}
                  </button>
                </>
              )}
              <Badge variant="outline" className={cn("border-transparent", statutStyles[visite.statut])}>
                {visite.statut}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
