"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { GlassModal } from "@/components/glass/glass-modal";
import { GlassCalendar } from "@/components/glass/glass-calendar";
import { Button } from "@/components/ui/button";
import { InstagramBadge, FacebookBadge } from "@/components/studio/brand-icons";
import { cn } from "@/lib/utils";
import type { ReseauPlateforme } from "@/lib/mock-data";

export type ChoixProgrammation = { plateformes: ReseauPlateforme[]; dateHeure: Date };

// Sélection date + heure façon Apple Calendar, et canaux à publier
// simultanément. Regroupement volontaire : Instagram et Facebook sont
// combinables entre eux (même connexion Meta, même type de contenu) —
// l'email est un canal à part, avec son propre contenu, jamais mélangé
// ici.
export function ProgrammerModal({
  open,
  onClose,
  plateformeInitiale,
  onConfirmer,
}: {
  open: boolean;
  onClose: () => void;
  plateformeInitiale: ReseauPlateforme;
  onConfirmer: (choix: ChoixProgrammation) => Promise<void> | void;
}) {
  const [date, setDate] = useState(() => new Date());
  const [heure, setHeure] = useState("09:00");
  const [plateformes, setPlateformes] = useState<ReseauPlateforme[]>([plateformeInitiale]);
  const [enCours, setEnCours] = useState(false);

  function togglePlateforme(p: ReseauPlateforme) {
    setPlateformes((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  async function confirmer() {
    if (plateformes.length === 0) return;
    const [h, m] = heure.split(":").map(Number);
    const dateHeure = new Date(date);
    dateHeure.setHours(h ?? 9, m ?? 0, 0, 0);
    setEnCours(true);
    await onConfirmer({ plateformes, dateHeure });
    setEnCours(false);
  }

  return (
    <GlassModal open={open} onClose={onClose} title="Programmer la publication" maxWidthClassName="max-w-md">
      <div className="flex flex-col gap-6">
        <div className="flex justify-center">
          <GlassCalendar selection={date} onSelect={setDate} />
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium tracking-wide text-white/60 uppercase">Heure</p>
          <input
            type="time"
            value={heure}
            onChange={(e) => setHeure(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white [color-scheme:dark]"
          />
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium tracking-wide text-white/60 uppercase">
            Canaux — réseaux sociaux (combinables)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => togglePlateforme("Instagram")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                plateformes.includes("Instagram")
                  ? "border-gold/60 bg-gold/15 text-white"
                  : "border-white/20 text-white/60 hover:bg-white/5"
              )}
            >
              <InstagramBadge className="size-4" />
              Instagram
            </button>
            <button
              onClick={() => togglePlateforme("Facebook")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                plateformes.includes("Facebook")
                  ? "border-gold/60 bg-gold/15 text-white"
                  : "border-white/20 text-white/60 hover:bg-white/5"
              )}
            >
              <FacebookBadge className="size-4" />
              Facebook
            </button>
          </div>
          {plateformes.length === 0 && <p className="mt-1.5 text-xs text-destructive">Choisissez au moins un canal.</p>}
        </div>

        <Button
          className="bg-gold text-white hover:bg-gold/90"
          disabled={plateformes.length === 0 || enCours}
          onClick={confirmer}
        >
          <CalendarClock className="size-4" />
          Programmer
        </Button>
      </div>
    </GlassModal>
  );
}
