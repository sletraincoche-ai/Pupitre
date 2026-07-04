"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { DayEventsList } from "@/components/agenda/day-events-list";
import type { AgendaEvent } from "@/lib/agenda";

function formatDateLongue(dateKey: string) {
  const [annee, mois, jour] = dateKey.split("-").map(Number);
  const formatted = new Date(annee, mois - 1, jour).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function DayPanel({
  dateKey,
  events,
  caveValidees,
  onValiderCave,
  onSupprimerPersonnel,
  onClose,
}: {
  dateKey: string | null;
  events: AgendaEvent[];
  caveValidees: Set<string>;
  onValiderCave: (id: string) => void;
  onSupprimerPersonnel: (id: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!dateKey) return;
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [dateKey, onClose]);

  return (
    <AnimatePresence>
      {dateKey && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-ink/50"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-background shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border/70 px-6 py-4">
              <h2 className="font-heading text-lg text-ink">{formatDateLongue(dateKey)}</h2>
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="flex size-8 items-center justify-center rounded-md text-stone hover:bg-muted hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <DayEventsList
                events={events}
                caveValidees={caveValidees}
                onValiderCave={onValiderCave}
                onSupprimerPersonnel={onSupprimerPersonnel}
              />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
