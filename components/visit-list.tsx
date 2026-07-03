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
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
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
                  {visite.statut === "En attente" && (
                    <Button
                      size="sm"
                      className="bg-vine text-white hover:bg-vine/90"
                      onClick={() => confirmer(visite)}
                    >
                      Confirmer
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-stone hover:text-vine"
                    onClick={() =>
                      toast.info(`Détails de la visite — ${visite.client}`)
                    }
                  >
                    Détails
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
