import { Wine } from "lucide-react";
import { photosDomaine } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// Représente une photo de la banque d'images (6.3) — tuile dégradée +
// légende, cohérente avec le rendu de la banque elle-même, en l'absence
// de vrais fichiers image dans ce prototype.
export function PhotoTile({ photoId, className }: { photoId: string; className?: string }) {
  const photo = photosDomaine.find((p) => p.id === photoId);
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-vine/80 to-gold/50 text-center",
        className
      )}
    >
      <Wine className="size-8 text-white/90" strokeWidth={1.25} />
      {photo && <p className="px-3 text-[10px] leading-tight text-white/85">{photo.legende}</p>}
    </div>
  );
}
