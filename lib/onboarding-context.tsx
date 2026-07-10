"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";

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
  const { user, hydrated: authHydrated } = useAuth();
  const [etat, setEtat] = useState<OnboardingState>(etatInitial);
  const [hydrated, setHydrated] = useState(false);

  // Un compte tout juste créé n'a jamais de rang onboarding_state en base
  // → tunnelTermine reste à false (valeur par défaut) et le tunnel
  // "Bienvenu sur Studio AI" s'affiche automatiquement à la première
  // connexion, exactement comme demandé.
  useEffect(() => {
    if (!authHydrated) return;
    let annule = false;
    setHydrated(false);
    if (!user) {
      setEtat(etatInitial);
      setHydrated(true);
      return;
    }
    fetch("/api/studio/onboarding")
      .then((r) => r.json())
      .then((data) => {
        if (!annule) setEtat({ ...etatInitial, ...data });
      })
      .catch(() => {
        if (!annule) setEtat(etatInitial);
      })
      .finally(() => {
        if (!annule) setHydrated(true);
      });
    return () => {
      annule = true;
    };
  }, [user, authHydrated]);

  useEffect(() => {
    if (!hydrated || !user) return;
    fetch("/api/studio/onboarding", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(etat),
    }).catch(() => {});
  }, [hydrated, etat, user]);

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
