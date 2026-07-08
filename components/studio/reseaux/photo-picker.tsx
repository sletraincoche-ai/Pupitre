"use client";

import { Check, ChevronUp, ChevronDown, X } from "lucide-react";
import { PhotoTile } from "@/components/studio/photo-tile";
import { photosDomaine } from "@/lib/mock-data";

export function PhotoPicker({
  selection,
  onChange,
}: {
  selection: string[];
  onChange: (photos: string[]) => void;
}) {
  function toggle(id: string) {
    if (selection.includes(id)) {
      onChange(selection.filter((p) => p !== id));
    } else {
      onChange([...selection, id]);
    }
  }

  function monter(index: number) {
    if (index === 0) return;
    const next = [...selection];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  function descendre(index: number) {
    if (index === selection.length - 1) return;
    const next = [...selection];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      {selection.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-stone">
            Sélection ({selection.length}){selection.length > 1 ? " — ordre du carrousel" : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {selection.map((id, index) => (
              <div key={id} className="relative size-16 overflow-hidden rounded-[3px] border border-border">
                <PhotoTile photoId={id} className="size-full" />
                <button
                  onClick={() => toggle(id)}
                  aria-label="Retirer"
                  className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-ink/70 text-white"
                >
                  <X className="size-2.5" />
                </button>
                {selection.length > 1 && (
                  <div className="absolute bottom-0.5 right-0.5 flex gap-0.5">
                    <button
                      onClick={() => monter(index)}
                      disabled={index === 0}
                      aria-label="Monter"
                      className="flex size-4 items-center justify-center rounded bg-ink/70 text-white disabled:opacity-30"
                    >
                      <ChevronUp className="size-2.5" />
                    </button>
                    <button
                      onClick={() => descendre(index)}
                      disabled={index === selection.length - 1}
                      aria-label="Descendre"
                      className="flex size-4 items-center justify-center rounded bg-ink/70 text-white disabled:opacity-30"
                    >
                      <ChevronDown className="size-2.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-1.5 text-xs font-medium text-stone">Banque d&apos;images</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {photosDomaine.map((photo) => {
            const selected = selection.includes(photo.id);
            return (
              <button
                key={photo.id}
                onClick={() => toggle(photo.id)}
                className="relative aspect-square overflow-hidden rounded-[3px] border border-border"
              >
                <PhotoTile photoId={photo.id} className="size-full" />
                {selected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-vine/50">
                    <Check className="size-4 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
