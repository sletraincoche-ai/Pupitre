"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";
import { GlassPanel } from "@/components/glass/glass-panel";
import { photosDomaine } from "@/lib/mock-data";

type PhotoUploadee = { id: string; url: string; legende: string };

// Trois vraies photos du domaine réparties sur les vignettes, cohérent
// avec l'aperçu du tableau de bord.
const photosVariees = [
  "/images/glass/photos/feuille-contre-jour.jpg",
  "/images/glass/photos/rangs-de-vigne.jpg",
  "/images/glass/photos/cave-tonneaux.jpg",
];

export function GlassImageBank() {
  const [uploads, setUploads] = useState<PhotoUploadee[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const nouvelles: PhotoUploadee[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({ id: `up-${Date.now()}-${f.name}`, url: URL.createObjectURL(f), legende: f.name }));
    if (nouvelles.length === 0) return;
    setUploads((prev) => [...nouvelles, ...prev]);
    toast.success(`${nouvelles.length} photo${nouvelles.length > 1 ? "s ajoutées" : " ajoutée"}`, {
      description: "Disponibles pour illustrer vos prochaines publications.",
    });
  }

  function supprimer(id: string) {
    setUploads((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <GlassPanel intensity="strong" className="p-6">
      <p className="text-lg font-semibold tracking-tight text-white">Banque d&apos;images du domaine</p>
      <p className="mt-0.5 text-sm text-white/65">
        Seules ces photos illustrent vos publications — jamais une banque d&apos;images générique.
      </p>

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
        className="mt-5 flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-white/25 bg-white/5 px-6 py-8 text-center transition-colors hover:border-gold/60 hover:bg-white/10"
      >
        <ImagePlus className="size-6 text-gold" />
        <p className="text-sm font-medium text-white">Ajouter des photos</p>
        <p className="text-xs text-white/55">Glissez-déposez ou cliquez pour choisir des fichiers</p>
      </button>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {uploads.map((photo) => (
          <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-2xl border border-white/15">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt={photo.legende} className="size-full object-cover" />
            <button
              onClick={() => supprimer(photo.id)}
              aria-label="Retirer"
              className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        {photosDomaine.map((photo, i) => (
          <div key={photo.id} className="relative aspect-square overflow-hidden rounded-2xl border border-white/15">
            <Image
              src={photosVariees[i % photosVariees.length]}
              alt={photo.legende}
              fill
              sizes="(min-width: 1024px) 220px, 45vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pt-4 pb-2">
              <p className="text-xs leading-tight text-white">{photo.legende}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
