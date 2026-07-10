"use client";

import { useConnexionsModal } from "@/lib/connexions-modal-context";
import { cn } from "@/lib/utils";

// Badge discret cliquable — rouvre directement le panneau de connexion,
// posé sur les blocs Studio dont le canal requis n'est pas connecté.
// Toujours nichée dans un lien ou un bouton parent (bloc Studio, onglet de
// canal) : un <span role="button"> évite le contenu interactif imbriqué
// (<button>/<a> dans <a> ou <button>), invalide en HTML et signalé par
// React comme erreur d'hydratation.
export function BadgeNonConnecte({ className }: { className?: string }) {
  const { ouvrir } = useConnexionsModal();

  function activer(e: { preventDefault: () => void; stopPropagation: () => void }) {
    e.preventDefault();
    e.stopPropagation();
    ouvrir();
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={activer}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") activer(e);
      }}
      className={cn(
        "cursor-pointer rounded-full border border-white/20 bg-black/30 px-2 py-0.5 text-[10px] font-medium text-white/70 backdrop-blur-sm hover:bg-black/45 hover:text-white",
        className
      )}
    >
      Non connecté
    </span>
  );
}
