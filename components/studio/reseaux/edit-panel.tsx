"use client";

import { Music2 } from "lucide-react";
import { PhotoPicker } from "@/components/studio/reseaux/photo-picker";
import type { FormatContenu, ReseauPlateforme } from "@/lib/mock-data";

const suggestionsMusique = [
  "Golden Hour — instrumental",
  "Vineyard Morning — acoustique",
  "Cellar Groove — jazz léger",
  "Harvest Sun — chill",
];

export type ContenuEdite = {
  plateforme: ReseauPlateforme;
  format: FormatContenu;
  photos: string[];
  legende: string;
  hashtags: string[];
  musique?: string;
};

export function EditPanel({
  edited,
  onChange,
}: {
  edited: ContenuEdite;
  onChange: (next: ContenuEdite) => void;
}) {
  const hashtagsTexte = edited.hashtags.join(", ");

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-sm font-medium text-ink">Photos</p>
        <PhotoPicker selection={edited.photos} onChange={(photos) => onChange({ ...edited, photos })} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-ink">Légende</label>
        <textarea
          value={edited.legende}
          onChange={(e) => onChange({ ...edited, legende: e.target.value })}
          rows={4}
          placeholder="Écrivez votre légende…"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-ink outline-none placeholder:text-stone focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      {edited.format === "story" && (
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">Musique</label>
          <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-background px-3 py-2">
            <Music2 className="size-4 text-gold" />
            <span className="flex-1 text-sm text-ink">{edited.musique ?? "Aucune"}</span>
            <button
              onClick={() => {
                const idx = suggestionsMusique.indexOf(edited.musique ?? "");
                const next = suggestionsMusique[(idx + 1) % suggestionsMusique.length];
                onChange({ ...edited, musique: next });
              }}
              className="text-sm font-medium text-vine hover:underline"
            >
              Changer
            </button>
          </div>
        </div>
      )}

      {edited.format !== "story" && edited.plateforme === "Instagram" && (
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">Hashtags</label>
          <input
            value={hashtagsTexte}
            onChange={(e) =>
              onChange({
                ...edited,
                hashtags: e.target.value
                  .split(",")
                  .map((h) => h.trim().replace(/^#/, ""))
                  .filter(Boolean),
              })
            }
            placeholder="ChampagnePupitre, Vendanges2026"
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-ink outline-none placeholder:text-stone focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      )}
    </div>
  );
}
