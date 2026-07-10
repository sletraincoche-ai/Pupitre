"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// État global (ouvert/fermé) du panneau "Connectez vos comptes", pour
// pouvoir le rouvrir depuis n'importe quelle action bloquée par un canal
// non connecté, sans naviguer hors de l'écran courant.
type ConnexionsModalContextValue = {
  ouverte: boolean;
  ouvrir: () => void;
  fermer: () => void;
};

const ConnexionsModalContext = createContext<ConnexionsModalContextValue | null>(null);

export function ConnexionsModalProvider({ children }: { children: ReactNode }) {
  const [ouverte, setOuverte] = useState(false);

  return (
    <ConnexionsModalContext.Provider
      value={{ ouverte, ouvrir: () => setOuverte(true), fermer: () => setOuverte(false) }}
    >
      {children}
    </ConnexionsModalContext.Provider>
  );
}

export function useConnexionsModal() {
  const context = useContext(ConnexionsModalContext);
  if (!context) {
    throw new Error("useConnexionsModal doit être utilisé dans un ConnexionsModalProvider");
  }
  return context;
}
