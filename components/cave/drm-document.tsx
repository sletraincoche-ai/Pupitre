"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDrmData } from "@/lib/cave";
import type { Cuvee, Mouvement } from "@/lib/mock-data";

function formatHL(valeur: number) {
  return `${valeur.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} hL`;
}

function Ligne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/50 py-2 text-sm last:border-0">
      <span className="text-stone">{label}</span>
      <span className="font-medium tabular-nums text-ink">{valeur}</span>
    </div>
  );
}

function SectionTitre({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="bg-vine px-4 py-2 text-sm font-medium tracking-wide text-white uppercase">
      {children}
    </h3>
  );
}

export function DrmDocument({
  moisCle,
  cuvees,
  mouvements,
}: {
  moisCle: string;
  cuvees: Cuvee[];
  mouvements: Mouvement[];
}) {
  const data = getDrmData(cuvees, mouvements, moisCle);
  const totalSorties = data.sortiesFranceHL + data.exportHL + data.pertesHL;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border/70 bg-background p-5">
        <p className="text-xs tracking-wider text-stone uppercase">
          Récapitulatif DRM
        </p>
        <h3 className="mt-1 font-heading text-2xl text-ink">{data.moisLabel}</h3>
        <p className="mt-2 text-sm text-stone">
          N° d&apos;accise (CRD) : <span className="text-ink">{data.numeroAccise}</span>
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/70">
        <SectionTitre>Stocks</SectionTitre>
        <div className="px-4 py-1">
          <Ligne label="Stock en hectolitres au début du mois" valeur={formatHL(data.stockDebutHL)} />
          <Ligne label="Stock en hectolitres en fin de mois" valeur={formatHL(data.stockFinHL)} />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/70">
        <SectionTitre>Sorties</SectionTitre>
        <div className="px-4 py-1">
          <Ligne label="Ventes France (hL)" valeur={formatHL(data.sortiesFranceHL)} />
          <Ligne label="Exportations (hL)" valeur={formatHL(data.exportHL)} />
          <Ligne label="Pertes et casse (hL)" valeur={formatHL(data.pertesHL)} />
          <Ligne label="Total sorties" valeur={formatHL(totalSorties)} />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/70">
        <SectionTitre>Entrées</SectionTitre>
        <div className="px-4 py-1">
          <Ligne label="Dégorgements / retours (hL)" valeur={formatHL(data.entreesHL)} />
          <Ligne label="Total entrées" valeur={formatHL(data.entreesHL)} />
        </div>
      </div>

      <div className="rounded-lg border border-gold/40 bg-gold/5 p-4 text-sm text-stone">
        Ce document est calculé à partir de vos {data.nombreMouvements} mouvements
        de cave enregistrés en {data.moisLabel.toLowerCase()}. Il est à{" "}
        <span className="font-medium text-ink">recopier manuellement sur CIEL</span>{" "}
        — Pupitre ne dépose jamais votre déclaration à votre place.
      </div>

      <Button
        variant="outline"
        className="self-start"
        onClick={() => window.print()}
      >
        <Printer className="size-4" />
        Imprimer
      </Button>
    </div>
  );
}
