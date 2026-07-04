"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { construireCharte, type ReponsesIdentite } from "@/lib/identity";
import type { CharteNarrative } from "@/lib/mock-data";

const STORAGE_KEY = "pupitre.identite.v1";

type IdentiteStockee = {
  consentement: boolean;
  etapeCourante: number;
  reponses: ReponsesIdentite;
  charte: CharteNarrative | null;
};

const etatInitial: IdentiteStockee = {
  consentement: false,
  etapeCourante: 0,
  reponses: {},
  charte: null,
};

type IdentityContextValue = IdentiteStockee & {
  hydrated: boolean;
  accepterConsentement: () => void;
  setReponse: (id: string, valeur: string) => void;
  setEtape: (etape: number) => void;
  terminerQuiz: () => void;
  recommencerEdition: () => void;
};

const IdentityContext = createContext<IdentityContextValue | null>(null);

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [etat, setEtat] = useState<IdentiteStockee>(etatInitial);
  const [hydrated, setHydrated] = useState(false);
  const hydrateRef = useRef(false);

  useEffect(() => {
    try {
      const brut = window.localStorage.getItem(STORAGE_KEY);
      if (brut) {
        setEtat({ ...etatInitial, ...JSON.parse(brut) });
      }
    } catch {
      // stockage indisponible ou corrompu — on repart de l'état initial
    }
    hydrateRef.current = true;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrateRef.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(etat));
  }, [etat]);

  function accepterConsentement() {
    setEtat((e) => ({ ...e, consentement: true }));
  }

  function setReponse(id: string, valeur: string) {
    setEtat((e) => ({ ...e, reponses: { ...e.reponses, [id]: valeur } }));
  }

  function setEtape(etape: number) {
    setEtat((e) => ({ ...e, etapeCourante: etape }));
  }

  function terminerQuiz() {
    setEtat((e) => ({ ...e, charte: construireCharte(e.reponses) }));
  }

  function recommencerEdition() {
    setEtat((e) => ({ ...e, etapeCourante: 0 }));
  }

  return (
    <IdentityContext.Provider
      value={{
        ...etat,
        hydrated,
        accepterConsentement,
        setReponse,
        setEtape,
        terminerQuiz,
        recommencerEdition,
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity() {
  const context = useContext(IdentityContext);
  if (!context) {
    throw new Error("useIdentity doit être utilisé dans un IdentityProvider");
  }
  return context;
}
