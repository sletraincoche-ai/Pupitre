"use client";

import { Music2 } from "lucide-react";
import { PhotoPicker } from "@/components/studio/reseaux/photo-picker";
import { HashtagInput } from "@/components/studio/reseaux/hashtag-input";
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
  suggestionsHashtags = [],
}: {
  edited: ContenuEdite;
  onChange: (next: ContenuEdite) => void;
  suggestionsHashtags?: string[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-white/60 uppercase">Photos</p>
        <PhotoPicker selection={edited.photos} onChange={(photos) => onChange({ ...edited, photos })} />
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium tracking-wide text-white/60 uppercase">
          Légende
        </label>
        <textarea
          value={edited.legende}
          onChange={(e) => onChange({ ...edited, legende: e.target.value })}
          rows={4}
          placeholder="Écrivez votre légende…"
          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus-visible:border-white/40 focus-visible:ring-3 focus-visible:ring-white/20"
        />
      </div>

      {edited.format === "story" && (
        <div>
          <label className="mb-2 block text-xs font-medium tracking-wide text-white/60 uppercase">
            Musique
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2">
            <Music2 className="size-4 text-gold" />
            <span className="flex-1 text-sm text-white">{edited.musique ?? "Aucune"}</span>
            <button
              onClick={() => {
                const idx = suggestionsMusique.indexOf(edited.musique ?? "");
                const next = suggestionsMusique[(idx + 1) % suggestionsMusique.length];
                onChange({ ...edited, musique: next });
              }}
              className="text-sm font-medium text-gold hover:underline"
            >
              Changer
            </button>
          </div>
        </div>
      )}

      {edited.format !== "story" && edited.plateforme === "Instagram" && (
        <div>
          <label className="mb-2 block text-xs font-medium tracking-wide text-white/60 uppercase">
            Hashtags
          </label>
          <HashtagInput
            hashtags={edited.hashtags}
            suggestions={suggestionsHashtags}
            onChange={(hashtags) => onChange({ ...edited, hashtags })}
          />
        </div>
      )}
    </div>
  );
}
