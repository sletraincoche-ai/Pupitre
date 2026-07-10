"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { debuterEcriture, terminerEcriture } from "@/lib/pending-writes";
import type { PublicationReelle } from "@/lib/publications";

type NouvellePublication = Omit<PublicationReelle, "id" | "date">;
type ChangementsPublication = Partial<NouvellePublication> & { statut?: PublicationReelle["statut"] };

type PublicationsContextValue = {
  publications: PublicationReelle[];
  hydrated: boolean;
  creer: (contenu: NouvellePublication) => Promise<PublicationReelle | null>;
  mettreAJour: (id: string, changements: ChangementsPublication) => Promise<PublicationReelle | null>;
};

const PublicationsContext = createContext<PublicationsContextValue | null>(null);

export function PublicationsProvider({ children }: { children: ReactNode }) {
  const { user, hydrated: authHydrated } = useAuth();
  const [publications, setPublications] = useState<PublicationReelle[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!authHydrated) return;
    let annule = false;
    setHydrated(false);
    if (!user) {
      setPublications([]);
      setHydrated(true);
      return;
    }
    fetch("/api/studio/publications")
      .then((r) => r.json())
      .then((data) => {
        if (!annule) setPublications(data.publications ?? []);
      })
      .catch(() => {
        if (!annule) setPublications([]);
      })
      .finally(() => {
        if (!annule) setHydrated(true);
      });
    return () => {
      annule = true;
    };
  }, [user, authHydrated]);

  async function creer(contenu: NouvellePublication) {
    // keepalive : la sauvegarde doit survivre si l'utilisateur enchaîne
    // aussitôt sur une déconnexion ou une navigation (voir le même
    // correctif sur identity-context/onboarding-context).
    debuterEcriture();
    try {
      const res = await fetch("/api/studio/publications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(contenu),
        keepalive: true,
      });
      if (!res.ok) return null;
      const { publication } = (await res.json()) as { publication: PublicationReelle };
      setPublications((prev) => [publication, ...prev]);
      return publication;
    } finally {
      terminerEcriture();
    }
  }

  async function mettreAJour(id: string, changements: ChangementsPublication) {
    debuterEcriture();
    try {
      const res = await fetch("/api/studio/publications", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, ...changements }),
        keepalive: true,
      });
      if (!res.ok) return null;
      const { publication } = (await res.json()) as { publication: PublicationReelle };
      setPublications((prev) => prev.map((p) => (p.id === publication.id ? publication : p)));
      return publication;
    } finally {
      terminerEcriture();
    }
  }

  return (
    <PublicationsContext.Provider value={{ publications, hydrated, creer, mettreAJour }}>
      {children}
    </PublicationsContext.Provider>
  );
}

export function usePublications() {
  const context = useContext(PublicationsContext);
  if (!context) {
    throw new Error("usePublications doit être utilisé dans un PublicationsProvider");
  }
  return context;
}
