"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Variante Liquid Glass du Modal générique (components/ui/modal.tsx) —
// utilisée par le Studio IA, la Cave, Clients, Visites et la
// Facturation reconstruits. Le Modal clair reste utilisé tel quel par
// Agenda, non concerné par ces conversions.
//
// Rendu via portail (createPortal vers document.body) — jamais un enfant
// direct de l'arbre React à l'endroit de son appel. Raison concrète : un
// GlassModal ouvert depuis un composant imbriqué dans un GlassPanel (qui
// pose backdrop-blur-xl) se retrouvait avec son "position: fixed" recadré
// sur la boîte du panneau au lieu du viewport entier — le CSS
// backdrop-filter établit un containing block pour ses descendants fixed
// (même règle que "transform"), cassant le plein écran et coupant
// visuellement le contenu du modal. Un portail rend ce bug impossible,
// quel que soit l'endroit d'où GlassModal est appelé.
export function GlassModal({
  open,
  onClose,
  title,
  children,
  maxWidthClassName = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidthClassName?: string;
}) {
  const [monte, setMonte] = useState(false);
  useEffect(() => setMonte(true), []);

  useEffect(() => {
    if (!open) return;
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [open, onClose]);

  if (!monte) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-4 pt-[8vh] sm:p-6 sm:pt-[8vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative z-10 flex max-h-[84vh] w-full flex-col overflow-hidden rounded-[28px] border border-white/15 bg-black/55 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl backdrop-saturate-150",
              maxWidthClassName
            )}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
              <h2 className="font-heading text-lg text-white">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="flex size-8 items-center justify-center rounded-md text-white/60 hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
