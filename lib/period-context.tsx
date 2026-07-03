"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type PeriodValue = "mois" | "30j" | "trimestre" | "annee" | "custom";

export const periodOptions: { value: PeriodValue; label: string }[] = [
  { value: "mois", label: "Ce mois" },
  { value: "30j", label: "30 jours" },
  { value: "trimestre", label: "Trimestre" },
  { value: "annee", label: "Année" },
  { value: "custom", label: "Personnalisé" },
];

export const periodComparisonLabel: Record<PeriodValue, string> = {
  mois: "vs mois dernier",
  "30j": "vs 30 jours précédents",
  trimestre: "vs trimestre précédent",
  annee: "vs année précédente",
  custom: "vs période précédente",
};

type PeriodContextValue = {
  period: PeriodValue;
  setPeriod: (period: PeriodValue) => void;
};

const PeriodContext = createContext<PeriodContextValue | null>(null);

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<PeriodValue>("mois");

  return (
    <PeriodContext.Provider value={{ period, setPeriod }}>
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriod() {
  const context = useContext(PeriodContext);
  if (!context) {
    throw new Error("usePeriod doit être utilisé dans un PeriodProvider");
  }
  return context;
}
