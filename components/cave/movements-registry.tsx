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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MovementQuickEntry } from "@/components/cave/movement-quick-entry";
import { MovementsTable, nomCuvee } from "@/components/cave/movements-table";
import type { Cuvee, Mouvement, MouvementType } from "@/lib/mock-data";
import {
  getMoisDisponibles,
  getMouvementsTries,
  getVentesComptoirDuMois,
  moisADeclarer,
  moisLabel,
} from "@/lib/cave";

const typeLabels: Record<MouvementType, string> = {
  entree: "Entrée",
  sortie: "Sortie",
  perte: "Perte",
};

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

        <MovementsTable mouvements={mouvementsFiltres} cuvees={cuvees} />
      </CardContent>
    </Card>
  );
}
