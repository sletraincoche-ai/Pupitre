"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";
import { GlassPanel } from "@/components/glass/glass-panel";
import { usePhotos } from "@/lib/photos-context";

export function GlassImageBank() {
  const { photos, ajouter, supprimer } = usePhotos();
  const [enCours, setEnCours] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const nombre = files.length;
    setEnCours(true);
    await ajouter(files);
    setEnCours(false);
    toast.success(`${nombre} photo${nombre > 1 ? "s ajoutées" : " ajoutée"}`, {
      description: "Disponibles pour illustrer vos prochaines publications.",
    });
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
        disabled={enCours}
        className="mt-5 flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-white/25 bg-white/5 px-6 py-8 text-center transition-colors hover:border-gold/60 hover:bg-white/10 disabled:opacity-60"
      >
        <ImagePlus className="size-6 text-gold" />
        <p className="text-sm font-medium text-white">{enCours ? "Envoi en cours…" : "Ajouter des photos"}</p>
        <p className="text-xs text-white/55">Glissez-déposez ou cliquez pour choisir des fichiers</p>
      </button>

      {photos.length === 0 ? (
        <p className="mt-5 py-6 text-center text-sm text-white/50">
          Aucune photo pour l&apos;instant. Ajoutez les premières photos de votre domaine.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
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
        </div>
      )}
    </GlassPanel>
  );
}
