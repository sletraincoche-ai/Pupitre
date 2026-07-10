"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";

export type GmailConnectionInfo = { email: string; connecteLe: string };

type GmailConnectionContextValue = {
  connecte: boolean;
  info: GmailConnectionInfo | null;
  hydrated: boolean;
  deconnecter: () => Promise<void>;
  rafraichir: () => Promise<void>;
};

const GmailConnectionContext = createContext<GmailConnectionContextValue | null>(null);

// Connexion Gmail réelle (OAuth2, scope gmail.send) — l'état vient
// toujours du serveur (table gmail_connections), jamais du localStorage :
// les tokens n'existent que côté serveur, donc seul le serveur sait s'ils
// sont encore valides.
export function GmailConnectionProvider({ children }: { children: ReactNode }) {
  const { user, hydrated: authHydrated } = useAuth();
  const [connecte, setConnecte] = useState(false);
  const [info, setInfo] = useState<GmailConnectionInfo | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const rafraichir = useCallback(async () => {
    const res = await fetch("/api/studio/gmail");
    const data = await res.json().catch(() => ({ connecte: false }));
    setConnecte(!!data.connecte);
    setInfo(data.connecte ? { email: data.email, connecteLe: data.connecteLe } : null);
  }, []);

  useEffect(() => {
    if (!authHydrated) return;
    if (!user) {
      setConnecte(false);
      setInfo(null);
      setHydrated(true);
      return;
    }
    setHydrated(false);
    rafraichir().finally(() => setHydrated(true));
  }, [user, authHydrated, rafraichir]);

  const deconnecter = useCallback(async () => {
    setConnecte(false);
    setInfo(null);
    await fetch("/api/studio/gmail", { method: "DELETE" }).catch(() => {});
  }, []);

  return (
    <GmailConnectionContext.Provider value={{ connecte, info, hydrated, deconnecter, rafraichir }}>
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
