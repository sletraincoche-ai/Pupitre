"use client";

import Link from "next/link";
import { toast } from "sonner";
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
import { getStockCalcule, type StockCuveeCalcule } from "@/lib/cave";
import type { Cuvee, Mouvement } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const statutStyles: Record<StockCuveeCalcule["statut"], string> = {
  vert: "bg-vine/10 text-vine",
  or: "bg-gold/15 text-gold",
  rouge: "bg-destructive/10 text-destructive",
};

function formatEcoulement(valeur: number | null) {
  if (valeur === null) return "—";
  return `${valeur.toFixed(1)} mois`;
}

function CampagneButton({ nom }: { nom: string }) {
  return (
    <Button
      size="sm"
      variant="outline"
      className="border-gold/40 text-gold hover:bg-gold/5"
      nativeButton={false}
      render={
        <Link
          href={`/dashboard/studio?suggestion=${encodeURIComponent(nom)}`}
          onClick={() =>
            toast.success(`Suggestion envoyée au Studio IA`, {
              description: `Campagne d'écoulement pour ${nom}`,
            })
          }
        >
          <TrendingUp className="size-3.5" />
          Lancer une campagne
        </Link>
      }
    />
  );
}

export function StockTable({
  cuvees,
  mouvements,
}: {
  cuvees: Cuvee[];
  mouvements: Mouvement[];
}) {
  const stock = getStockCalcule(cuvees, mouvements);

  return (
    <Card className="border border-border/70 bg-card shadow-none">
      <CardHeader className="px-6">
        <CardTitle>Stock détaillé par cuvée et millésime</CardTitle>
        <CardDescription>
          Calculé depuis vos mouvements — disponible, réservé et alloué distincts
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        {/* Tableau (>= 640px) */}
        <div className="hidden overflow-hidden rounded-xl border border-border/70 sm:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Cuvée</TableHead>
                <TableHead>Disponible</TableHead>
                <TableHead>Réservé</TableHead>
                <TableHead>Alloué</TableHead>
                <TableHead>Écoulement</TableHead>
                <TableHead className="pr-4 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stock.map((s) => (
                <TableRow key={s.cuvee.id}>
                  <TableCell className="pl-4 font-medium text-ink">
                    {s.cuvee.nom}
                    {s.cuvee.millesime !== "NV" && (
                      <span className="ml-1.5 text-stone">{s.cuvee.millesime}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-ink">
                    {s.disponibleCommercial.toLocaleString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-stone">
                    {s.cuvee.reserve.toLocaleString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-stone">
                    {s.cuvee.alloue.toLocaleString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border-transparent", statutStyles[s.statut])}>
                      {formatEcoulement(s.ecoulementMois)}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    {s.surstock && <CampagneButton nom={s.cuvee.nom} />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Cartes empilées (< 640px) */}
        <div className="flex flex-col gap-3 sm:hidden">
          {stock.map((s) => (
            <div key={s.cuvee.id} className="rounded-xl border border-border/70 bg-background p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-ink">
                  {s.cuvee.nom}
                  {s.cuvee.millesime !== "NV" && (
                    <span className="ml-1.5 text-stone">{s.cuvee.millesime}</span>
                  )}
                </p>
                <Badge variant="outline" className={cn("shrink-0 border-transparent", statutStyles[s.statut])}>
                  {formatEcoulement(s.ecoulementMois)}
                </Badge>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-sm">
                <dt className="text-stone">Disponible</dt>
                <dd className="text-right text-ink">
                  {s.disponibleCommercial.toLocaleString("fr-FR")}
                </dd>
                <dt className="text-stone">Réservé</dt>
                <dd className="text-right text-ink">{s.cuvee.reserve.toLocaleString("fr-FR")}</dd>
                <dt className="text-stone">Alloué</dt>
                <dd className="text-right text-ink">{s.cuvee.alloue.toLocaleString("fr-FR")}</dd>
              </dl>
              {s.surstock && (
                <div className="mt-3 flex justify-end">
                  <CampagneButton nom={s.cuvee.nom} />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
