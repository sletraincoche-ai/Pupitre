"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { attendreEcrituresEnCours } from "@/lib/pending-writes";

export type CurrentUser = { id: string; identifiant: string };

type AuthContextValue = {
  user: CurrentUser | null;
  hydrated: boolean;
  connexion: (identifiant: string, motDePasse: string) => Promise<string | null>;
  inscription: (identifiant: string, motDePasse: string) => Promise<string | null>;
  deconnexion: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function poster(url: string, body: unknown): Promise<{ user: CurrentUser | null; erreur: string | null }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { user: null, erreur: data.error ?? "Une erreur est survenue." };
  return { user: data.user ?? null, erreur: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setHydrated(true));
  }, []);

  const connexion = useCallback(async (identifiant: string, motDePasse: string) => {
    const { user: u, erreur } = await poster("/api/auth/login", { identifiant, motDePasse });
    if (u) setUser(u);
    return erreur;
  }, []);

  const inscription = useCallback(async (identifiant: string, motDePasse: string) => {
    const { user: u, erreur } = await poster("/api/auth/register", { identifiant, motDePasse });
    if (u) setUser(u);
    return erreur;
  }, []);

  const deconnexion = useCallback(async () => {
    // Attend que les sauvegardes en cours (identité, onboarding, photos,
    // publications) se terminent avant d'invalider la session — sinon une
    // requête encore en vol peut arriver après coup, échouer (401) et
    // perdre silencieusement la donnée qu'on venait de créer.
    await attendreEcrituresEnCours();
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, hydrated, connexion, inscription, deconnexion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}
