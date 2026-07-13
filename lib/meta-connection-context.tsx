"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";

export type MetaConnectionInfo = { pageName: string | null; connecteLe: string };

export type InstagramConnectionInfo = {
  connecte: boolean;
  // Compte Business lié à la Page, sans que la permission de publication
  // ait forcément été accordée sur le token actuel — voir
  // permissionManquante.
  lie: boolean;
  permissionManquante: boolean;
  username: string | null;
};

const instagramInitial: InstagramConnectionInfo = {
  connecte: false,
  lie: false,
  permissionManquante: false,
  username: null,
};

type MetaConnectionContextValue = {
  connecte: boolean;
  // Un compte Facebook lié mais gérant plusieurs Pages reste `connecte`
  // sans Page active tant que l'utilisateur n'a pas choisi laquelle
  // utiliser — la publication reste bloquée jusque-là (voir
  // choisirPageRequise() dans lib/meta.ts, appliqué côté serveur).
  choixPageRequis: boolean;
  info: MetaConnectionInfo | null;
  instagram: InstagramConnectionInfo;
  hydrated: boolean;
  deconnecter: () => Promise<void>;
  rafraichir: () => Promise<void>;
};

const MetaConnectionContext = createContext<MetaConnectionContextValue | null>(null);

// Connexion Meta réelle (OAuth2 Facebook Login, Instagram Business lié à
// la même Page) — l'état vient toujours du serveur (table
// meta_connections), jamais du localStorage : les tokens n'existent que
// côté serveur, donc seul le serveur sait s'ils sont encore valides.
export function MetaConnectionProvider({ children }: { children: ReactNode }) {
  const { user, hydrated: authHydrated } = useAuth();
  const [connecte, setConnecte] = useState(false);
  const [choixPageRequis, setChoixPageRequis] = useState(false);
  const [info, setInfo] = useState<MetaConnectionInfo | null>(null);
  const [instagram, setInstagram] = useState<InstagramConnectionInfo>(instagramInitial);
  const [hydrated, setHydrated] = useState(false);

  const rafraichir = useCallback(async () => {
    const res = await fetch("/api/studio/meta");
    const data = await res.json().catch(() => ({ connecte: false, instagram: instagramInitial }));
    setConnecte(!!data.connecte);
    setChoixPageRequis(!!data.choixPageRequis);
    setInfo(data.connecte ? { pageName: data.pageName, connecteLe: data.connecteLe } : null);
    setInstagram(data.instagram ?? instagramInitial);
  }, []);

  useEffect(() => {
    if (!authHydrated) return;
    if (!user) {
      setConnecte(false);
      setChoixPageRequis(false);
      setInfo(null);
      setInstagram(instagramInitial);
      setHydrated(true);
      return;
    }
    setHydrated(false);
    rafraichir().finally(() => setHydrated(true));
  }, [user, authHydrated, rafraichir]);

  const deconnecter = useCallback(async () => {
    setConnecte(false);
    setChoixPageRequis(false);
    setInfo(null);
    setInstagram(instagramInitial);
    await fetch("/api/studio/meta", { method: "DELETE" }).catch(() => {});
  }, []);

  return (
    <MetaConnectionContext.Provider
      value={{ connecte, choixPageRequis, info, instagram, hydrated, deconnecter, rafraichir }}
    >
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
