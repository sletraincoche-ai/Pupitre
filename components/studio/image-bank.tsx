"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Wine, X } from "lucide-react";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { photosDomaine } from "@/lib/mock-data";

type PhotoUploadee = { id: string; url: string; legende: string };

export function ImageBank() {
  const [uploads, setUploads] = useState<PhotoUploadee[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const nouvelles: PhotoUploadee[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        id: `up-${Date.now()}-${f.name}`,
        url: URL.createObjectURL(f),
        legende: f.name,
      }));
    if (nouvelles.length === 0) return;
    setUploads((prev) => [...nouvelles, ...prev]);
    toast.success(
      `${nouvelles.length} photo${nouvelles.length > 1 ? "s ajoutées" : " ajoutée"}`,
      { description: "Disponibles pour illustrer vos prochaines publications." }
    );
  }

  function supprimer(id: string) {
    setUploads((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="mx-auto max-w-3xl border border-border bg-card">
      <CardHeader className="px-6">
        <CardTitle>Banque d&apos;images du domaine</CardTitle>
        <CardDescription>
          Seules ces photos illustrent vos publications — jamais une banque d&apos;images
          générique.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-[3px] border border-dashed border-border bg-background px-6 py-8 text-center hover:border-gold/50"
        >
          <ImagePlus className="size-6 text-gold" />
          <p className="text-sm font-medium text-ink">Ajouter des photos</p>
          <p className="text-xs text-stone">Glissez-déposez ou cliquez pour choisir des fichiers</p>
        </button>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {uploads.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-[3px] border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.legende} className="size-full object-cover" />
              <button
                onClick={() => supprimer(photo.id)}
                aria-label="Retirer"
                className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-[3px] bg-ink/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          {photosDomaine.map((photo) => (
            <div
              key={photo.id}
              title={photo.legende}
              className="flex aspect-square flex-col items-center justify-center gap-2 rounded-[3px] border border-border bg-muted/40 p-2 text-center"
            >
              <Wine className="size-6 text-vine/60" />
              <p className="text-xs text-stone">{photo.legende}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </div>
  );
}
