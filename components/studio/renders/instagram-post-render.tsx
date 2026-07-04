"use client";

import { useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { InstagramBadge } from "@/components/studio/brand-icons";
import { PhotoTile } from "@/components/studio/photo-tile";
import { domaineProfile } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function InstagramPostRender({
  photos,
  legende,
  hashtags,
}: {
  photos: string[];
  legende: string;
  hashtags: string[];
}) {
  const [index, setIndex] = useState(0);
  const photo = photos[Math.min(index, photos.length - 1)] ?? photos[0];

  return (
    <div className="pt-11">
      <div className="flex items-center gap-1.5 border-b border-neutral-100 px-3 py-2">
        <InstagramBadge className="size-5" />
        <span className="text-sm font-semibold text-black">Instagram</span>
      </div>

      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-tr from-gold to-vine text-xs font-medium text-white">
            {domaineProfile.initiales}
          </span>
          <span className="text-sm font-semibold text-black">{domaineProfile.instagramHandle}</span>
        </div>
        <MoreHorizontal className="size-4 text-black" />
      </div>

      <div className="relative aspect-square w-full">
        <PhotoTile photoId={photo} className="size-full" />
        {photos.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {photos.map((p, i) => (
              <button
                key={p + i}
                onClick={() => setIndex(i)}
                aria-label={`Photo ${i + 1}`}
                className={cn("size-1.5 rounded-full", i === index ? "bg-white" : "bg-white/40")}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3.5 px-3 pt-2.5 text-black">
        <Heart className="size-6" strokeWidth={1.5} />
        <MessageCircle className="size-6" strokeWidth={1.5} />
        <Send className="size-6" strokeWidth={1.5} />
        <Bookmark className="ml-auto size-6" strokeWidth={1.5} />
      </div>
      <p className="px-3 pt-1.5 text-[13px] font-semibold text-black">142 mentions J&apos;aime</p>
      <p className="px-3 pb-4 pt-1 text-[13px] leading-snug text-black">
        <span className="font-semibold">{domaineProfile.instagramHandle}</span> {legende}{" "}
        {hashtags.map((h) => (
          <span key={h} className="text-[#00376B]">
            #{h}{" "}
          </span>
        ))}
      </p>
    </div>
  );
}
