import { Wifi, Signal, BatteryFull } from "lucide-react";
import { cn } from "@/lib/utils";

// Maquette d'iPhone 15 en CSS pur — aucune image externe. Dynamic Island,
// boutons latéraux, barre de statut et indicateur home, pour que chaque
// rendu de publication s'ouvre dans un cadre fidèle à la plateforme réelle.
export function IPhoneFrame({
  children,
  statusBarStyle = "dark",
  className,
}: {
  children: React.ReactNode;
  statusBarStyle?: "dark" | "light";
  className?: string;
}) {
  const statusColor = statusBarStyle === "light" ? "text-white" : "text-black";

  return (
    <div className={cn("relative mx-auto w-[300px]", className)}>
      {/* Boutons latéraux */}
      <div className="absolute -left-[2px] top-[110px] h-8 w-[3px] rounded-l-sm bg-neutral-700" />
      <div className="absolute -left-[2px] top-[155px] h-14 w-[3px] rounded-l-sm bg-neutral-700" />
      <div className="absolute -left-[2px] top-[220px] h-14 w-[3px] rounded-l-sm bg-neutral-700" />
      <div className="absolute -right-[2px] top-[170px] h-20 w-[3px] rounded-r-sm bg-neutral-700" />

      {/* Boîtier */}
      <div className="relative overflow-hidden rounded-[55px] border-[6px] border-neutral-900 bg-black shadow-2xl">
        <div className="relative aspect-[300/650] w-full overflow-hidden rounded-[46px] bg-white">
          {/* Contenu de l'écran */}
          <div className="absolute inset-0 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {children}
          </div>

          {/* Barre de statut */}
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-8 pt-2.5 text-[13px] font-semibold",
              statusColor
            )}
          >
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <Signal className="size-3.5" strokeWidth={2.5} />
              <Wifi className="size-3.5" strokeWidth={2.5} />
              <BatteryFull className="size-4" strokeWidth={2} />
            </div>
          </div>

          {/* Dynamic Island */}
          <div className="pointer-events-none absolute left-1/2 top-2.5 h-[26px] w-[90px] -translate-x-1/2 rounded-full bg-black" />

          {/* Indicateur home */}
          <div className="pointer-events-none absolute bottom-1.5 left-1/2 h-[5px] w-[120px] -translate-x-1/2 rounded-full bg-black/80" />
        </div>
      </div>
    </div>
  );
}
