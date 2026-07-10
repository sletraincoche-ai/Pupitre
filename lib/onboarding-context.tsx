"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { debuterEcriture, terminerEcriture } from "@/lib/pending-writes";

type OnboardingState = {
  tunnelTermine: boolean;
  etapeTunnel: number;
};

const etatInitial: OnboardingState = { tunnelTermine: false, etapeTunnel: 0 };

type OnboardingContextValue = OnboardingState & {
  hydrated: boolean;
  // Vrai uniquement sur la réponse qui vient de créer le rang en base
  // (tout premier accès à Studio IA pour ce compte) — signal ponctuel,
  // jamais persisté ni réécrit, pour afficher le tunnel cette unique
  // fois sans jamais faire mentir `tunnelTermine` (toujours fidèle à la
  // base, y compris dès cette toute première réponse).
  premierAcces: boolean;
  setEtapeTunnel: (etape: number) => void;
  terminerTunnel: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user, hydrated: authHydrated } = useAuth();
  const [etat, setEtat] = useState<OnboardingState>(etatInitial);
  const [hydrated, setHydrated] = useState(false);
  const [premierAcces, setPremierAcces] = useState(false);
  const dernierEtatServeur = useRef<OnboardingState | null>(null);
  const premierAccesConstate = useRef(false);

  // Remise à zéro *pendant le rendu* (pas dans un effet) dès que le
  // compte connecté change — évite un commit transitoire où `user` a
  // déjà changé mais où `hydrated`/`etat` retiennent encore l'instantané
  // du compte précédent : sans ça, l'effet d'écriture ci-dessous peut
  // s'exécuter sur ce commit intermédiaire et réémettre ce vieil état
  // vers le nouveau compte, écrasant par exemple la marque "tunnel déjà
  // vu" posée atomiquement par le serveur. Ce motif ("state reset on
  // prop change") est le pattern React recommandé : l'appel à setState
  // ici redéclenche un rendu avant tout commit, donc l'effet ne voit
  // jamais cet état périmé.
  const [utilisateurSuivi, setUtilisateurSuivi] = useState(user);
  if (user?.id !== utilisateurSuivi?.id) {
    setUtilisateurSuivi(user);
    setHydrated(false);
    setEtat(etatInitial);
    setPremierAcces(false);
    dernierEtatServeur.current = null;
    premierAccesConstate.current = false;
  }

  useEffect(() => {
    if (!authHydrated) return;
    let annule = false;
    if (!user) {
      setHydrated(true);
      return;
    }
    fetch("/api/studio/onboarding")
      .then((r) => r.json())
      .then((data) => {
        if (data.premierAcces) premierAccesConstate.current = true;
        if (annule) return;
        const nouvel = { tunnelTermine: !!data.tunnelTermine, etapeTunnel: data.etapeTunnel ?? 0 };
        dernierEtatServeur.current = nouvel;
        setPremierAcces(premierAccesConstate.current);
        setEtat(nouvel);
        setHydrated(true);
      })
      .catch(() => {
        if (annule) return;
        setEtat(etatInitial);
        setHydrated(true);
      });
    return () => {
      annule = true;
    };
  }, [user, authHydrated]);

  useEffect(() => {
    if (!hydrated || !user) return;
    if (
      dernierEtatServeur.current &&
      dernierEtatServeur.current.tunnelTermine === etat.tunnelTermine &&
      dernierEtatServeur.current.etapeTunnel === etat.etapeTunnel
    ) {
      return;
    }
    debuterEcriture();
    // keepalive : l'étape peut changer juste avant un lien externe (ex.
    // "Connecter Instagram & Facebook" vers /api/auth/meta/start) — sans
    // ça, la navigation immédiate annule la requête en vol et l'étape
    // retombe à sa valeur précédente au retour du flux de connexion.
    fetch("/api/studio/onboarding", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(etat),
      keepalive: true,
    })
      .catch(() => {})
      .finally(() => terminerEcriture());
  }, [hydrated, etat, user]);

  function setEtapeTunnel(etape: number) {
    setEtat((e) => ({ ...e, etapeTunnel: etape }));
  }

  function terminerTunnel() {
    setEtat((e) => ({ ...e, tunnelTermine: true }));
  }

  return (
    <OnboardingContext.Provider
      value={{ ...etat, hydrated, premierAcces, setEtapeTunnel, terminerTunnel }}
    >
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
