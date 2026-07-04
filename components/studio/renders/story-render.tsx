import { X, Music2, Heart, Send } from "lucide-react";
import { PhotoTile } from "@/components/studio/photo-tile";
import { domaineProfile, type ReseauPlateforme } from "@/lib/mock-data";

export function StoryRender({
  plateforme,
  photos,
  legende,
  musique,
}: {
  plateforme: ReseauPlateforme;
  photos: string[];
  legende: string;
  musique?: string;
}) {
  const handle =
    plateforme === "Instagram" ? domaineProfile.instagramHandle : domaineProfile.facebookHandle;

  return (
    <div className="relative h-full w-full">
      <PhotoTile photoId={photos[0]} className="absolute inset-0 size-full" />

      <div className="absolute inset-x-2 top-9 flex gap-1">
        {photos.map((p, i) => (
          <div key={p + i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35">
            {i === 0 && <div className="h-full w-2/3 rounded-full bg-white" />}
          </div>
        ))}
      </div>

      <div className="absolute inset-x-3 top-13 flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-tr from-gold to-vine text-[10px] font-medium text-white ring-2 ring-white">
          {domaineProfile.initiales}
        </span>
        <span className="text-[13px] font-semibold text-white drop-shadow">{handle}</span>
        <span className="text-[12px] text-white/80">2 h</span>
        <X className="ml-auto size-5 text-white" strokeWidth={2.5} />
      </div>

      <div className="absolute inset-x-4 bottom-24">
        <p className="text-center text-[15px] font-semibold leading-snug text-white drop-shadow-lg">
          {legende}
        </p>
        {musique && (
          <div className="mt-3 flex w-fit items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-xs text-white">
            <Music2 className="size-3.5" />
            {musique}
          </div>
        )}
      </div>

      <div className="absolute inset-x-3 bottom-4 flex items-center gap-2">
        <div className="flex-1 rounded-full border border-white/50 px-4 py-2 text-[13px] text-white/80">
          Envoyer un message
        </div>
        <Heart className="size-6 text-white" strokeWidth={1.5} />
        <Send className="size-6 text-white" strokeWidth={1.5} />
      </div>
    </div>
  );
}
