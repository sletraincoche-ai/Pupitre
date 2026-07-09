"use client";

import { useState } from "react";
import { X } from "lucide-react";

function nettoyer(valeur: string): string {
  return valeur.trim().replace(/^#/, "").replace(/[^a-zA-Z0-9À-ÿ]/g, "");
}

export function HashtagInput({
  hashtags,
  suggestions,
  onChange,
}: {
  hashtags: string[];
  suggestions: string[];
  onChange: (next: string[]) => void;
}) {
  const [brouillon, setBrouillon] = useState("");

  function ajouter(valeur: string) {
    const propre = nettoyer(valeur);
    if (!propre || hashtags.includes(propre)) {
      setBrouillon("");
      return;
    }
    onChange([...hashtags, propre]);
    setBrouillon("");
  }

  function retirer(tag: string) {
    onChange(hashtags.filter((h) => h !== tag));
  }

  const suggestionsRestantes = suggestions.filter((s) => !hashtags.includes(s)).slice(0, 3);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-2 py-1.5 focus-within:border-white/40 focus-within:ring-3 focus-within:ring-white/20">
        {hashtags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2 py-0.5 text-xs font-medium text-white"
          >
            #{tag}
            <button
              type="button"
              onClick={() => retirer(tag)}
              aria-label={`Retirer ${tag}`}
              className="text-white/60 hover:text-destructive"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={brouillon}
          onChange={(e) => setBrouillon(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              ajouter(brouillon);
            } else if (e.key === "Backspace" && brouillon === "" && hashtags.length > 0) {
              retirer(hashtags[hashtags.length - 1]);
            }
          }}
          onBlur={() => brouillon && ajouter(brouillon)}
          placeholder={hashtags.length === 0 ? "Ajouter un hashtag, entrée pour valider…" : ""}
          className="h-6 min-w-[120px] flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
        />
      </div>

      {suggestionsRestantes.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-white/50">Suggestions de la charte :</span>
          {suggestionsRestantes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ajouter(s)}
              className="rounded-lg border border-dashed border-gold/50 px-2 py-0.5 text-xs font-medium text-gold hover:bg-gold/10"
            >
              + #{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
