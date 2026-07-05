"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "pupitre.meta-connexion.v1";

export type MetaConnectionInfo = {
  demo: boolean;
  instagramUsername: string;
  instagramInitiales: string;
  facebookPageName: string;
  dateConnexion: string;
};

type MetaConnectionState = {
  connecte: boolean;
  info: MetaConnectionInfo | null;
};

const etatInitial: MetaConnectionState = { connecte: false, info: null };

type MetaConnectionContextValue = MetaConnectionState & {
  hydrated: boolean;
  connecter: (info: MetaConnectionInfo) => void;
  deconnecter: () => void;
};

const MetaConnectionContext = createContext<MetaConnectionContextValue | null>(null);

export function MetaConnectionProvider({ children }: { children: ReactNode }) {
  const [etat, setEtat] = useState<MetaConnectionState>(etatInitial);
  const [hydrated, setHydrated] = useState(false);

  // Lit une seule fois au montage. Gate l'effet d'écriture sur l'état
  // `hydrated` (pas une ref) : sous React Strict Mode, les effets de
  // montage s'exécutent deux fois avant qu'un re-render ne reflète les
  // setState — une ref mutée de façon synchrone ferait passer la garde
  // avant que `etat` ne contienne réellement la valeur lue, écrasant une
  // connexion existante par l'état initial.
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

  function connecter(info: MetaConnectionInfo) {
    setEtat({ connecte: true, info });
  }

  function deconnecter() {
    setEtat(etatInitial);
  }

  return (
    <MetaConnectionContext.Provider value={{ ...etat, hydrated, connecter, deconnecter }}>
      {children}
    </MetaConnectionContext.Provider>
  );
}

export function useMetaConnection() {
  const context = useContext(MetaConnectionContext);
  if (!context) {
    throw new Error("useMetaConnection doit être utilisé dans un MetaConnectionProvider");
  }
  return context;
}
