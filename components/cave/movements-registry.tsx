"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Download, Receipt } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MovementQuickEntry } from "@/components/cave/movement-quick-entry";
import { MovementDetailModal } from "@/components/cave/movement-detail-modal";
import type { Cuvee, Mouvement, MouvementType } from "@/lib/mock-data";
import {
  getMoisDisponibles,
  getMouvementsTries,
  getVentesComptoirDuMois,
  moisADeclarer,
  moisLabel,
} from "@/lib/cave";
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

function nomCuvee(cuvees: Cuvee[], cuveeId: string) {
  const c = cuvees.find((c) => c.id === cuveeId);
  if (!c) return "—";
  return c.millesime !== "NV" ? `${c.nom} ${c.millesime}` : c.nom;
}

function exportCsv(mouvements: Mouvement[], cuvees: Cuvee[]) {
  const header = [
    "Date",
    "Heure",
    "Type",
    "Cuvée",
    "Quantité",
    "Origine",
    "Client",
    "Prix unitaire",
    "Montant",
    "Auteur",
  ];
  const rows = mouvements.map((m) => [
    m.date,
    m.heure,
    typeLabels[m.type],
    nomCuvee(cuvees, m.cuveeId),
    String(m.quantite),
    m.origine,
    m.clientNom ?? "",
    m.prixUnitaire !== undefined ? String(m.prixUnitaire) : "",
    m.prixUnitaire !== undefined ? String(m.prixUnitaire * m.quantite) : "",
    m.auteur,
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";"))
    .join("\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mouvements-cave.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function MovementsRegistry({
  cuvees,
  mouvements,
  onAddMouvement,
  onCreateCuvee,
}: {
  cuvees: Cuvee[];
  mouvements: Mouvement[];
  onAddMouvement: (mouvement: Mouvement) => void;
  onCreateCuvee: (nom: string) => Cuvee;
}) {
  const [entreeActive, setEntreeActive] = useState<MouvementType | null>(null);
  const [filterCuvee, setFilterCuvee] = useState("tous");
  const [filterType, setFilterType] = useState("tous");
  const [filterMois, setFilterMois] = useState("tous");
  const [detail, setDetail] = useState<Mouvement | null>(null);

  const moisDisponibles = getMoisDisponibles(mouvements);
  const moisCourant = moisADeclarer();
  const reconciliation = getVentesComptoirDuMois(mouvements, moisCourant);

  const mouvementsFiltres = useMemo(() => {
    return getMouvementsTries(mouvements).filter((m) => {
      if (filterCuvee !== "tous" && m.cuveeId !== filterCuvee) return false;
      if (filterType !== "tous" && m.type !== filterType) return false;
      if (filterMois !== "tous" && m.date.slice(0, 7) !== filterMois) return false;
      return true;
    });
  }, [mouvements, filterCuvee, filterType, filterMois]);

  function handleSubmitMouvement(mouvement: Mouvement) {
    onAddMouvement(mouvement);
    setEntreeActive(null);
    toast.success(`${typeLabels[mouvement.type]} enregistrée`, {
      description: `${mouvement.quantite} bout. — ${nomCuvee(cuvees, mouvement.cuveeId)}`,
    });
  }

  return (
    <Card className="border border-border/70 bg-card shadow-none">
      <CardHeader className="px-6">
        <CardTitle>Registre des mouvements</CardTitle>
        <CardDescription>
          Chaque vente, réception ou perte se saisit ici — elle alimente le
          stock, la DRM et le tableau de bord automatiquement.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            className="bg-gold text-white hover:bg-gold/90"
            onClick={() => setEntreeActive("sortie")}
          >
            <ArrowUpFromLine className="size-4" />
            Sortie
          </Button>
          <Button
            variant="outline"
            onClick={() => setEntreeActive("entree")}
          >
            <ArrowDownToLine className="size-4" />
            Entrée
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => setEntreeActive("perte")}
          >
            <AlertTriangle className="size-4" />
            Perte
          </Button>

          <div className="ml-auto flex items-center gap-2 rounded-lg border border-border/70 bg-background px-3 py-1.5 text-sm text-stone">
            <Receipt className="size-4 text-gold" />
            {reconciliation.nombre} vente{reconciliation.nombre > 1 ? "s" : ""} comptoir ce mois ·{" "}
            <span className="font-medium text-ink">
              {reconciliation.montant.toLocaleString("fr-FR")} €
            </span>
          </div>
        </div>

        {entreeActive && (
          <MovementQuickEntry
            type={entreeActive}
            cuvees={cuvees}
            mouvements={mouvements}
            onCreateCuvee={onCreateCuvee}
            onSubmit={handleSubmitMouvement}
            onCancel={() => setEntreeActive(null)}
          />
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Select value={filterCuvee} onValueChange={(value) => value && setFilterCuvee(value)}>
            <SelectTrigger className="w-full text-sm sm:w-44">
              <SelectValue>
                {() => (filterCuvee === "tous" ? "Toutes les cuvées" : nomCuvee(cuvees, filterCuvee))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Toutes les cuvées</SelectItem>
              {cuvees.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {nomCuvee(cuvees, c.id)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={(value) => value && setFilterType(value)}>
            <SelectTrigger className="w-full text-sm sm:w-40">
              <SelectValue>
                {() => (filterType === "tous" ? "Tous les types" : typeLabels[filterType as MouvementType])}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les types</SelectItem>
              <SelectItem value="entree">Entrée</SelectItem>
              <SelectItem value="sortie">Sortie</SelectItem>
              <SelectItem value="perte">Perte</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterMois} onValueChange={(value) => value && setFilterMois(value)}>
            <SelectTrigger className="w-full text-sm sm:w-40">
              <SelectValue>
                {() => (filterMois === "tous" ? "Tous les mois" : moisLabel(filterMois))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les mois</SelectItem>
              {moisDisponibles.map((m) => (
                <SelectItem key={m} value={m}>
                  {moisLabel(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="ml-auto"
            onClick={() => {
              exportCsv(mouvementsFiltres, cuvees);
              toast.success("Export CSV téléchargé");
            }}
          >
            <Download className="size-4" />
            Export CSV
          </Button>
        </div>

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
              {mouvementsFiltres.map((m) => (
                <TableRow
                  key={m.id}
                  className="cursor-pointer"
                  onClick={() => setDetail(m)}
                >
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
              {mouvementsFiltres.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-stone">
                    Aucun mouvement pour ces filtres.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Cartes empilées (< 640px) */}
        <div className="flex flex-col gap-3 sm:hidden">
          {mouvementsFiltres.map((m) => (
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
          {mouvementsFiltres.length === 0 && (
            <p className="rounded-xl border border-dashed border-border/70 py-10 text-center text-stone">
              Aucun mouvement pour ces filtres.
            </p>
          )}
        </div>
      </CardContent>

      <MovementDetailModal
        mouvement={detail}
        cuvee={cuvees.find((c) => c.id === detail?.cuveeId)}
        onClose={() => setDetail(null)}
      />
    </Card>
  );
}
