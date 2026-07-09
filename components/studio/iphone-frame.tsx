import { Wifi, Signal, BatteryFull } from "lucide-react";
import { cn } from "@/lib/utils";

// Maquette d'iPhone 15 en CSS pur — aucune image externe. Dynamic Island,
// boutons latéraux, barre de statut et indicateur home, pour que chaque
// rendu de publication s'ouvre dans un cadre fidèle à la plateforme réelle.
// Largeur paramétrable ; les repères verticaux (boutons latéraux) sont en
// pourcentage pour rester alignés à n'importe quelle taille.
export function IPhoneFrame({
  children,
  statusBarStyle = "dark",
  width = 292,
  className,
}: {
  children: React.ReactNode;
  statusBarStyle?: "dark" | "light";
  width?: number;
  className?: string;
}) {
  const statusColor = statusBarStyle === "light" ? "text-white" : "text-black";

  return (
    <div className={cn("relative mx-auto", className)} style={{ width }}>
      {/* Boutons latéraux — positions en % de la hauteur du boîtier */}
      <div className="absolute -left-[2px] top-[17%] h-[1.2%] w-[3px] rounded-l-sm bg-neutral-700" />
      <div className="absolute -left-[2px] top-[24%] h-[2.2%] w-[3px] rounded-l-sm bg-neutral-700" />
      <div className="absolute -left-[2px] top-[34%] h-[2.2%] w-[3px] rounded-l-sm bg-neutral-700" />
      <div className="absolute -right-[2px] top-[26%] h-[3.1%] w-[3px] rounded-r-sm bg-neutral-700" />

      {/* Boîtier */}
      <div className="relative overflow-hidden rounded-[48px] border-[6px] border-neutral-900 bg-black shadow-2xl">
        <div className="relative aspect-[300/650] w-full overflow-hidden rounded-[40px] bg-white">
          {/* Contenu de l'écran */}
          <div className="absolute inset-0 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {children}
          </div>

          {/* Barre de statut */}
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-7 pt-2.5 text-[12px] font-semibold",
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
          <div className="pointer-events-none absolute left-1/2 top-2.5 h-[24px] w-[80px] -translate-x-1/2 rounded-full bg-black" />

          {/* Indicateur home */}
          <div className="pointer-events-none absolute bottom-1.5 left-1/2 h-[5px] w-[110px] -translate-x-1/2 rounded-full bg-black/80" />
        </div>
      </div>
    </div>
  );
}
