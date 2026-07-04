"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MovementDetailModal } from "@/components/cave/movement-detail-modal";
import type { Cuvee, Mouvement, MouvementType } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const typeBadgeStyles: Record<MouvementType, string> = {
  entree: "bg-vine/10 text-vine",
  sortie: "bg-gold/15 text-gold",
  perte: "bg-destructive/10 text-destructive",
};

const typeLabels: Record<MouvementType, string> = {
  entree: "Entrée",
  sortie: "Sortie",
  perte: "Perte",
};

export function nomCuvee(cuvees: Cuvee[], cuveeId: string) {
  const c = cuvees.find((c) => c.id === cuveeId);
  if (!c) return "—";
  return c.millesime !== "NV" ? `${c.nom} ${c.millesime}` : c.nom;
}

// Le registre de la Cave, réutilisé tel quel (même composant) partout où
// un historique de mouvements doit s'afficher — Cave elle-même comme la
// fiche client filtrée sur un seul client (7.3).
export function MovementsTable({
  mouvements,
  cuvees,
  emptyLabel = "Aucun mouvement pour ces filtres.",
}: {
  mouvements: Mouvement[];
  cuvees: Cuvee[];
  emptyLabel?: string;
}) {
  const [detail, setDetail] = useState<Mouvement | null>(null);

  return (
    <>
      {/* Tableau (>= 640px) */}
      <div className="hidden overflow-hidden rounded-xl border border-border/70 sm:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Date</TableHead>
              <TableHead>Cuvée</TableHead>
              <TableHead>Quantité</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="pr-4">Origine</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mouvements.map((m) => (
              <TableRow key={m.id} className="cursor-pointer" onClick={() => setDetail(m)}>
                <TableCell className="pl-4 whitespace-nowrap text-stone">
                  {m.date.split("-").reverse().join("/")} · {m.heure}
                </TableCell>
                <TableCell className="text-ink">{nomCuvee(cuvees, m.cuveeId)}</TableCell>
                <TableCell className="text-ink">{m.quantite}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("border-transparent", typeBadgeStyles[m.type])}>
                    {typeLabels[m.type]}
                  </Badge>
                </TableCell>
                <TableCell className="pr-4 text-stone">{m.origine}</TableCell>
              </TableRow>
            ))}
            {mouvements.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-stone">
                  {emptyLabel}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Cartes empilées (< 640px) */}
      <div className="flex flex-col gap-3 sm:hidden">
        {mouvements.map((m) => (
          <button
            key={m.id}
            onClick={() => setDetail(m)}
            className="rounded-xl border border-border/70 bg-background p-4 text-left"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-ink">{nomCuvee(cuvees, m.cuveeId)}</p>
              <Badge variant="outline" className={cn("shrink-0 border-transparent", typeBadgeStyles[m.type])}>
                {typeLabels[m.type]}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-stone">
              {m.date.split("-").reverse().join("/")} · {m.heure} — {m.quantite} bout. — {m.origine}
            </p>
          </button>
        ))}
        {mouvements.length === 0 && (
          <p className="rounded-xl border border-dashed border-border/70 py-10 text-center text-stone">
            {emptyLabel}
          </p>
        )}
      </div>

      <MovementDetailModal
        mouvement={detail}
        cuvee={cuvees.find((c) => c.id === detail?.cuveeId)}
        onClose={() => setDetail(null)}
      />
    </>
  );
}
