"use client";

import type { LucideIcon } from "lucide-react";
import { Menu } from "@base-ui/react/menu";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export type GlassContextMenuItem = {
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  destructive?: boolean;
};

// Menu contextuel réutilisable — à utiliser partout où une ligne/carte a
// des actions secondaires (Cave, Clients, Visites, ...), plutôt que de
// réinventer un popup local à chaque écran. S'appuie sur Menu.Portal de
// Base UI (@base-ui/react/menu, déjà utilisé par components/ui/select.tsx)
// pour rendre le popup hors de l'arborescence DOM du déclencheur : un
// GlassPanel avec overflow ne peut plus le couper ni le faire chevaucher
// le contenu voisin, contrairement à un positionnement local piégé dans
// le flux du parent.
export function GlassContextMenu({
  items,
  trigger,
  align = "end",
}: {
  items: GlassContextMenuItem[];
  trigger?: React.ReactNode;
  align?: "start" | "center" | "end";
}) {
  return (
    <Menu.Root>
      <Menu.Trigger
        onClick={(e) => e.stopPropagation()}
        aria-label="Actions"
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-white/50 outline-none hover:bg-white/10 hover:text-white data-[popup-open]:bg-white/10 data-[popup-open]:text-white"
      >
        {trigger ?? <MoreVertical className="size-4" />}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align={align} sideOffset={6} className="z-[80] outline-none">
          <Menu.Popup className="min-w-40 overflow-hidden rounded-2xl border border-white/15 bg-black/70 p-1 text-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl backdrop-saturate-150 outline-none">
            {items.map((item) => (
              <Menu.Item
                key={item.label}
                onClick={(e) => {
                  e.stopPropagation();
                  item.onSelect();
                }}
                className={cn(
                  "flex cursor-default items-center gap-2 rounded-xl px-3 py-2 outline-none select-none",
                  item.destructive ? "text-red-300 data-[highlighted]:bg-red-400/10" : "text-white/85 data-[highlighted]:bg-white/10"
                )}
              >
                {item.icon && <item.icon className="size-3.5" />}
                {item.label}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
