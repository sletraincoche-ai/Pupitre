"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import {
  cuvees as cuveesInitiales,
  mouvements as mouvementsInitiaux,
  type Cuvee,
  type Mouvement,
} from "@/lib/mock-data";

type CaveContextValue = {
  cuvees: Cuvee[];
  mouvements: Mouvement[];
  ajouterMouvement: (mouvement: Mouvement) => void;
  creerCuvee: (nom: string) => Cuvee;
};

const CaveContext = createContext<CaveContextValue | null>(null);

export function CaveProvider({ children }: { children: ReactNode }) {
  const [cuvees, setCuvees] = useState<Cuvee[]>(cuveesInitiales);
  const [mouvements, setMouvements] = useState<Mouvement[]>(mouvementsInitiaux);

  function ajouterMouvement(mouvement: Mouvement) {
    setMouvements((prev) => [mouvement, ...prev]);
  }

  function creerCuvee(nom: string): Cuvee {
    const nouvelle: Cuvee = {
      id: `cv-${Date.now()}`,
      nom,
      millesime: "NV",
      prixVenteDefaut: 0,
      stockInitial: 0,
      reserve: 0,
      alloue: 0,
    };
    setCuvees((prev) => [...prev, nouvelle]);
    return nouvelle;
  }

  return (
    <CaveContext.Provider value={{ cuvees, mouvements, ajouterMouvement, creerCuvee }}>
      {children}
    </CaveContext.Provider>
  );
}

export function useCave() {
  const context = useContext(CaveContext);
  if (!context) {
    throw new Error("useCave doit être utilisé dans un CaveProvider");
  }
  return context;
}
