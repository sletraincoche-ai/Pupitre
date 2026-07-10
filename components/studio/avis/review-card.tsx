"use client";

import { useRef, useState } from "react";
import { Star, Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AvisGoogle } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// Colonne 2 — aperçu du contenu réel, aucun contrôle dedans.
export function ReviewPreview({ avis }: { avis: AvisGoogle }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/95 p-6 text-left shadow-lg">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-vine/10 text-sm font-medium text-vine">
          {avis.auteur[0]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-ink">{avis.auteur}</p>
            <span className="text-xs text-stone">· {avis.langue}</span>
            <span className="font-mono text-xs text-stone tabular-nums">· {avis.date}</span>
          </div>
          <div className="mt-0.5 flex text-gold">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn("size-3.5", i < avis.note ? "fill-gold" : "fill-none")} />
            ))}
          </div>
          <p className="mt-2 text-sm text-ink">{avis.texte}</p>
        </div>
      </div>
    </div>
  );
}

// Colonne 3 — réponse éditable + actions de publication.
export function ReviewResponseEditor({
  avis,
  onPublier,
  onIgnorer,
}: {
  avis: AvisGoogle;
  onPublier: (reponse: string) => void;
  onIgnorer: () => void;
}) {
  const [reponse, setReponse] = useState(avis.reponseProposee);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-2 block text-xs font-medium tracking-wide text-white/60 uppercase">
          Réponse proposée
        </label>
        <textarea
          ref={textareaRef}
          value={reponse}
          onChange={(e) => setReponse(e.target.value)}
          rows={6}
          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none focus-visible:border-white/40 focus-visible:ring-3 focus-visible:ring-white/20"
        />
      </div>
      <div className="flex flex-wrap gap-2 border-t border-white/15 pt-5">
        <Button className="rounded-lg bg-gold text-white hover:bg-gold/90" onClick={() => onPublier(reponse)}>
          <Check className="size-4" />
          Publier la réponse
        </Button>
        <Button
          variant="outline"
          className="rounded-lg border-white/25 bg-transparent text-white hover:bg-white/10"
          onClick={() => textareaRef.current?.focus()}
        >
          <Pencil className="size-4" />
          Modifier
        </Button>
        <Button
          variant="ghost"
          className="rounded-lg text-white/70 hover:bg-white/10 hover:text-destructive"
          onClick={onIgnorer}
        >
          <X className="size-4" />
          Ignorer
        </Button>
      </div>
    </div>
  );
}
