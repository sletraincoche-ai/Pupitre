import { Globe, ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import { FacebookBadge } from "@/components/studio/brand-icons";
import { PhotoTile } from "@/components/studio/photo-tile";
import { domaineProfile } from "@/lib/mock-data";

export function FacebookPostRender({
  photos,
  legende,
}: {
  photos: string[];
  legende: string;
}) {
  return (
    <div className="pt-11">
      <div className="flex items-center gap-1.5 border-b border-neutral-100 px-3 py-2">
        <FacebookBadge className="size-5" />
        <span className="text-sm font-semibold text-black">facebook</span>
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-tr from-gold to-vine text-xs font-medium text-white">
          {domaineProfile.initiales}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-black">{domaineProfile.facebookHandle}</p>
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <span>À l&apos;instant</span>
            <Globe className="size-3" />
          </div>
        </div>
      </div>

      <p className="px-3 pb-2.5 text-[14px] leading-snug text-black">{legende}</p>

      <div className="relative aspect-video w-full">
        <PhotoTile photoId={photos[0]} className="size-full" />
      </div>

      <div className="flex items-center gap-1.5 border-b border-neutral-100 px-3 py-2 text-xs text-neutral-500">
        <span className="flex size-4 items-center justify-center rounded-full bg-[#1877F2] text-[9px] text-white">
          👍
        </span>
        48
      </div>

      <div className="flex items-center justify-around px-2 py-1.5">
        <button className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-neutral-600">
          <ThumbsUp className="size-4" />
          J&apos;aime
        </button>
        <button className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-neutral-600">
          <MessageCircle className="size-4" />
          Commenter
        </button>
        <button className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-neutral-600">
          <Share2 className="size-4" />
          Partager
        </button>
      </div>
    </div>
  );
}
