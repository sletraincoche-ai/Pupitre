"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { GlassModal } from "@/components/glass/glass-modal";
import { ConnexionsPanel } from "@/components/studio/connexions/connexions-panel";
import { useConnexionsModal } from "@/lib/connexions-modal-context";

const PARAMS_RETOUR_CONNEXION = [
  "google_connected",
  "google_error",
  "meta_connected",
  "meta_simulate",
  "meta_error",
];

// Monté une fois pour tout Studio IA (voir app/dashboard/studio/layout.tsx)
// — n'importe quelle action bloquée par un canal non connecté peut
// l'ouvrir via useConnexionsModal().ouvrir(), sans jamais quitter l'écran
// courant ni proposer de contournement.
export function ConnexionsModal() {
  const { ouverte, ouvrir, fermer } = useConnexionsModal();
  const searchParams = useSearchParams();

  // Le retour d'un flux OAuth (Google, Meta) est une redirection plein
  // écran : tout l'état client, y compris "la modale était ouverte",
  // repart de zéro. Sans ce guet posé ici (toujours monté, contrairement
  // au contenu de la modale qui ne monte que si `ouverte`), le résultat
  // de la connexion resterait dans l'URL sans jamais s'afficher si
  // l'utilisateur avait initié la connexion depuis le tunnel plutôt que
  // depuis cette modale.
  useEffect(() => {
    if (PARAMS_RETOUR_CONNEXION.some((cle) => searchParams.has(cle))) {
      ouvrir();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <GlassModal open={ouverte} onClose={fermer} title="Connectez vos comptes" maxWidthClassName="max-w-2xl">
      <p className="mb-4 text-sm text-white/60">
        Une connexion (même de démonstration) est nécessaire pour publier ou envoyer depuis le
        Studio.
      </p>
      <ConnexionsPanel />
    </GlassModal>
  );
}
