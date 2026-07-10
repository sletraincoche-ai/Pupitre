"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { ReponsesIdentite } from "@/lib/identity";
import type { CharteNarrative, OrigineEnrichissement, PilierHistoire } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";

type IdentiteStockee = {
  consentement: boolean;
  etapeCourante: number;
  reponses: ReponsesIdentite;
  // Proposée par l'IA en fin de quiz, pas encore acceptée par le vigneron.
  charteProposee: CharteNarrative | null;
  // Définitive, injectée dans chaque génération du Studio.
  charte: CharteNarrative | null;
};

const etatInitial: IdentiteStockee = {
  consentement: false,
  etapeCourante: 0,
  reponses: {},
  charteProposee: null,
  charte: null,
};

function dateDuJour() {
  return new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

type IdentityContextValue = IdentiteStockee & {
  hydrated: boolean;
  enGeneration: boolean;
  erreurGeneration: string | null;
  modeGeneration: "reel" | "simulation" | null;
  accepterConsentement: () => void;
  setReponse: (id: string, valeur: string) => void;
  setEtape: (etape: number) => void;
  genererCharte: () => Promise<void>;
  validerCharte: () => void;
  modifierCharteProposee: (charte: CharteNarrative) => void;
  supprimerEtRefaire: () => void;
  annulerProposition: () => void;
  ajouterEnrichissement: (texte: string, origine: OrigineEnrichissement) => void;
};

const IdentityContext = createContext<IdentityContextValue | null>(null);

export function IdentityProvider({ children }: { children: ReactNode }) {
  const { user, hydrated: authHydrated } = useAuth();
  const [etat, setEtat] = useState<IdentiteStockee>(etatInitial);
  const [hydrated, setHydrated] = useState(false);
  const [enGeneration, setEnGeneration] = useState(false);
  const [erreurGeneration, setErreurGeneration] = useState<string | null>(null);
  const [modeGeneration, setModeGeneration] = useState<"reel" | "simulation" | null>(null);

  // Recharge l'état depuis le compte connecté à chaque changement de
  // compte (connexion/déconnexion) — jamais d'état d'un compte visible
  // sous un autre. Gate l'effet d'écriture sur `hydrated` (pas une ref) :
  // le même raisonnement que pour l'ancienne persistance localStorage
  // s'applique, désormais appliqué par requête plutôt que par montage.
  useEffect(() => {
    if (!authHydrated) return;
    let annule = false;
    setHydrated(false);
    if (!user) {
      setEtat(etatInitial);
      setHydrated(true);
      return;
    }
    fetch("/api/studio/identity")
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
    fetch("/api/studio/identity", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(etat),
    }).catch(() => {
      // échec réseau — l'état local reste correct, on retentera à la
      // prochaine mutation.
    });
  }, [hydrated, etat, user]);

  function accepterConsentement() {
    setEtat((e) => ({ ...e, consentement: true }));
  }

  function setReponse(id: string, valeur: string) {
    setEtat((e) => ({ ...e, reponses: { ...e.reponses, [id]: valeur } }));
  }

  function setEtape(etape: number) {
    setEtat((e) => ({ ...e, etapeCourante: etape }));
  }

  async function genererCharte() {
    setEnGeneration(true);
    setErreurGeneration(null);
    try {
      const res = await fetch("/api/studio/generate-charte", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reponses: etat.reponses }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "La génération a échoué.");
      }
      setModeGeneration(data.mode);
      setEtat((e) => ({ ...e, charteProposee: data.charte as CharteNarrative }));
    } catch (erreur) {
      setErreurGeneration(erreur instanceof Error ? erreur.message : "La génération a échoué.");
    } finally {
      setEnGeneration(false);
    }
  }

  function validerCharte() {
    setEtat((e) => {
      if (!e.charteProposee) return e;
      const enrichissementsExistants = e.charte?.piliers.filter((p) => p.origine !== "test") ?? [];
      return {
        ...e,
        charteProposee: null,
        charte: {
          ...e.charteProposee,
          piliers: [...e.charteProposee.piliers, ...enrichissementsExistants],
        },
      };
    });
  }

  function modifierCharteProposee(charte: CharteNarrative) {
    setEtat((e) => ({ ...e, charteProposee: charte }));
  }

  function supprimerEtRefaire() {
    setEtat((e) => ({
      ...e,
      reponses: {},
      etapeCourante: 0,
      charteProposee: null,
    }));
    setErreurGeneration(null);
  }

  function annulerProposition() {
    setEtat((e) => ({ ...e, charteProposee: null }));
    setErreurGeneration(null);
  }

  function ajouterEnrichissement(texte: string, origine: OrigineEnrichissement) {
    const nouveauPilier: PilierHistoire = {
      id: `pilier-${origine}-${Date.now()}`,
      texte,
      origine,
      date: dateDuJour(),
    };
    setEtat((e) => ({
      ...e,
      charte: e.charte
        ? { ...e.charte, piliers: [...e.charte.piliers, nouveauPilier] }
        : { ton: "", vocabulaire: [], interdits: [], piliers: [nouveauPilier] },
    }));
  }

  return (
    <IdentityContext.Provider
      value={{
        ...etat,
        hydrated,
        enGeneration,
        erreurGeneration,
        modeGeneration,
        accepterConsentement,
        setReponse,
        setEtape,
        genererCharte,
        validerCharte,
        modifierCharteProposee,
        supprimerEtRefaire,
        annulerProposition,
        ajouterEnrichissement,
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity() {
  const context = useContext(IdentityContext);
  if (!context) {
    throw new Error("useIdentity doit être utilisé dans un IdentityProvider");
  }
  return context;
}
