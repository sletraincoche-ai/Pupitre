"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "pupitre.onboarding-studio.v1";

type OnboardingState = {
  tunnelTermine: boolean;
  etapeTunnel: number;
};

const etatInitial: OnboardingState = { tunnelTermine: false, etapeTunnel: 0 };

type OnboardingContextValue = OnboardingState & {
  hydrated: boolean;
  setEtapeTunnel: (etape: number) => void;
  terminerTunnel: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [etat, setEtat] = useState<OnboardingState>(etatInitial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const brut = window.localStorage.getItem(STORAGE_KEY);
      if (brut) {
        setEtat({ ...etatInitial, ...JSON.parse(brut) });
      }
    } catch {
      // stockage indisponible ou corrompu — on repart de l'état initial
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(etat));
  }, [hydrated, etat]);

  function setEtapeTunnel(etape: number) {
    setEtat((e) => ({ ...e, etapeTunnel: etape }));
  }

  function terminerTunnel() {
    setEtat((e) => ({ ...e, tunnelTermine: true }));
  }

  return (
    <OnboardingContext.Provider value={{ ...etat, hydrated, setEtapeTunnel, terminerTunnel }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding doit être utilisé dans un OnboardingProvider");
  }
  return context;
}
