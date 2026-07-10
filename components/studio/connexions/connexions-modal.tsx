"use client";

import { GlassModal } from "@/components/glass/glass-modal";
import { ConnexionsPanel } from "@/components/studio/connexions/connexions-panel";
import { useConnexionsModal } from "@/lib/connexions-modal-context";

// Monté une fois pour tout Studio IA (voir app/dashboard/studio/layout.tsx)
// — n'importe quelle action bloquée par un canal non connecté peut
// l'ouvrir via useConnexionsModal().ouvrir(), sans jamais quitter l'écran
// courant ni proposer de contournement.
export function ConnexionsModal() {
  const { ouverte, fermer } = useConnexionsModal();

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
