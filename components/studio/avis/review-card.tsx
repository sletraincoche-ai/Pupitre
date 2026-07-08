"use client";

import { useRef, useState } from "react";
import { Star, Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNumeroParId } from "@/lib/fiches";
import type { AvisGoogle } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function ReviewCard({
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
  const numero = getNumeroParId(avis.id);

  return (
    <div className="border border-border bg-card">
      <div className="flex flex-col gap-4 px-6 py-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-vine/10 text-sm font-medium text-vine">
            {avis.auteur[0]}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {numero && <span className="font-mono text-xs text-stone tabular-nums">N°{numero}</span>}
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

        <div className="ml-12 border border-border bg-muted/30 p-3">
          <p className="mb-1.5 text-xs font-medium tracking-wide text-stone uppercase">
            Réponse proposée
          </p>
          <textarea
            ref={textareaRef}
            value={reponse}
            onChange={(e) => setReponse(e.target.value)}
            rows={3}
            className="w-full rounded-[3px] border border-input bg-background px-3 py-2 text-sm text-ink outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              className="rounded-[3px] bg-vine text-white hover:bg-vine/90"
              onClick={() => onPublier(reponse)}
            >
              <Check className="size-3.5" />
              Publier la réponse
            </Button>
            <Button size="sm" variant="outline" className="rounded-[3px]" onClick={() => textareaRef.current?.focus()}>
              <Pencil className="size-3.5" />
              Modifier
            </Button>
            <Button size="sm" variant="ghost" className="rounded-[3px] text-stone hover:text-destructive" onClick={onIgnorer}>
              <X className="size-3.5" />
              Ignorer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
