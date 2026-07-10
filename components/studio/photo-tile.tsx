"use client";

import { Wine } from "lucide-react";
import { usePhotos } from "@/lib/photos-context";
import { cn } from "@/lib/utils";

export function PhotoTile({ photoId, className }: { photoId: string; className?: string }) {
  const { photos } = usePhotos();
  const photo = photos.find((p) => p.id === photoId);

  if (photo) {
    return (
      <div className={cn("overflow-hidden", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt={photo.legende} className="size-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-vine/80 to-gold/50 text-center",
        className
      )}
    >
      <Wine className="size-8 text-white/90" strokeWidth={1.25} />
    </div>
  );
}
