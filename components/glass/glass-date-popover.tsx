"use client";

import { useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { CalendarDays } from "lucide-react";
import { GlassCalendar } from "@/components/glass/glass-calendar";

// Sélecteur de date compact réutilisable — bouton + calendrier Liquid
// Glass en popover (portalé, jamais piégé dans l'overflow d'un
// GlassPanel ancêtre, même principe que GlassModal). Remplace les inputs
// date natifs du navigateur pour rester cohérent avec le reste de l'app.
export function GlassDatePopover({ date, onSelect, label }: { date: Date; onSelect: (date: Date) => void; label?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 outline-none hover:bg-white/10 data-[popup-open]:bg-white/10">
        <CalendarDays className="size-3.5" />
        {label ?? date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={8} className="z-[80] outline-none">
          <Popover.Popup className="rounded-[24px] border border-white/15 bg-black/70 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl backdrop-saturate-150 outline-none">
            <GlassCalendar
              selection={date}
              onSelect={(d) => {
                onSelect(d);
                setOpen(false);
              }}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
