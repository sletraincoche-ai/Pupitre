"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "pupitre.gmail-connexion.v1";

export type GmailConnectionInfo = {
  adresse: string;
  dateConnexion: string;
};

type GmailConnectionState = {
  connecte: boolean;
  info: GmailConnectionInfo | null;
};

const etatInitial: GmailConnectionState = { connecte: false, info: null };

function dateDuJour() {
  return new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

type GmailConnectionContextValue = GmailConnectionState & {
  hydrated: boolean;
  enConnexion: boolean;
  // Aucune vraie API Google branchée à ce stade — connexion fictive,
  // même principe que le mode démo Meta (isMetaConfigured()) : un
  // compte simulé plutôt qu'un flux OAuth réel.
  connecter: (adresse: string) => Promise<void>;
  deconnecter: () => void;
};

const GmailConnectionContext = createContext<GmailConnectionContextValue | null>(null);

export function GmailConnectionProvider({ children }: { children: ReactNode }) {
  const [etat, setEtat] = useState<GmailConnectionState>(etatInitial);
  const [hydrated, setHydrated] = useState(false);
  const [enConnexion, setEnConnexion] = useState(false);

  useEffect(() => {
    try {
      const brut = window.localStorage.getItem(STORAGE_KEY);
      if (brut) {
        setEtat({ ...etatInitial, ...JSON.parse(brut) });
      }
    } catch {
      // stockage indisponible ou corrompu — on repart déconnecté
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(etat));
  }, [hydrated, etat]);

  async function connecter(adresse: string) {
    setEnConnexion(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setEtat({ connecte: true, info: { adresse, dateConnexion: dateDuJour() } });
    setEnConnexion(false);
  }

  function deconnecter() {
    setEtat(etatInitial);
  }

  return (
    <GmailConnectionContext.Provider value={{ ...etat, hydrated, enConnexion, connecter, deconnecter }}>
      {children}
    </GmailConnectionContext.Provider>
  );
}

export function useGmailConnection() {
  const context = useContext(GmailConnectionContext);
  if (!context) {
    throw new Error("useGmailConnection doit être utilisé dans un GmailConnectionProvider");
  }
  return context;
}
