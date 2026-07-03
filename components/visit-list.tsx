"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { visites as initialVisites, type Visite } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const statusStyles: Record<Visite["statut"], string> = {
  Confirmée: "bg-vine/10 text-vine",
  "En attente": "bg-gold/15 text-gold",
  Annulée: "bg-destructive/10 text-destructive",
};

function VisitActions({
  visite,
  onConfirmer,
}: {
  visite: Visite;
  onConfirmer: (visite: Visite) => void;
}) {
  return (
    <>
      {visite.statut === "En attente" && (
        <Button
          size="sm"
          className="bg-vine text-white hover:bg-vine/90"
          onClick={() => onConfirmer(visite)}
        >
          Confirmer
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        className="text-stone hover:text-vine"
        onClick={() => toast.info(`Détails de la visite — ${visite.client}`)}
      >
        Détails
      </Button>
    </>
  );
}

export function VisitList() {
  const [visites, setVisites] = useState(initialVisites);

  function confirmer(visite: Visite) {
    setVisites((prev) =>
      prev.map((v) => (v.id === visite.id ? { ...v, statut: "Confirmée" } : v))
    );
    toast.success(`Visite confirmée pour ${visite.client}`, {
      description: `${visite.date} · ${visite.heure}`,
    });
  }

  return (
    <>
      {/* Tableau (>= 640px) */}
      <div className="hidden overflow-hidden rounded-xl border border-border/70 bg-card sm:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Groupe</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Langue</TableHead>
              <TableHead>Formule</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="pr-6 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visites.map((visite) => (
              <TableRow key={visite.id}>
                <TableCell className="pl-6 font-medium text-ink">
                  {visite.client}
                </TableCell>
                <TableCell className="text-stone">
                  <span className="whitespace-nowrap">
                    {visite.date} · {visite.heure}
                  </span>
                </TableCell>
                <TableCell className="text-stone">{visite.langue}</TableCell>
                <TableCell className="text-stone">{visite.formule}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("border-transparent", statusStyles[visite.statut])}
                  >
                    {visite.statut}
                  </Badge>
                </TableCell>
                <TableCell className="pr-6">
                  <div className="flex justify-end gap-2">
                    <VisitActions visite={visite} onConfirmer={confirmer} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Cartes empilées (< 640px) */}
      <div className="flex flex-col gap-3 sm:hidden">
        {visites.map((visite) => (
          <div key={visite.id} className="rounded-xl border border-border/70 bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-ink">{visite.client}</p>
              <Badge
                variant="outline"
                className={cn("shrink-0 border-transparent", statusStyles[visite.statut])}
              >
                {visite.statut}
              </Badge>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-sm">
              <dt className="text-stone">Date</dt>
              <dd className="text-right text-ink">
                {visite.date} · {visite.heure}
              </dd>
              <dt className="text-stone">Langue</dt>
              <dd className="text-right text-ink">{visite.langue}</dd>
              <dt className="text-stone">Formule</dt>
              <dd className="text-right text-ink">{visite.formule}</dd>
            </dl>
            <div className="mt-4 flex justify-end gap-2">
              <VisitActions visite={visite} onConfirmer={confirmer} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
