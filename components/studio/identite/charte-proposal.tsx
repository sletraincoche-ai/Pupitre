"use client";

import { useState } from "react";
import { Loader2, FileText, Check, Pencil, RotateCcw, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassPanel } from "@/components/glass/glass-panel";
import { useIdentity } from "@/lib/identity-context";
import type { CharteNarrative } from "@/lib/mock-data";

function versEdition(charte: CharteNarrative) {
  return {
    ton: charte.ton,
    piliers: charte.piliers.map((p) => p.texte).join("\n"),
    vocabulaire: charte.vocabulaire.join(", "),
    interdits: charte.interdits.join(", "),
  };
}

const champInput =
  "h-9 w-full rounded-lg border border-white/20 bg-white/10 px-3 text-sm text-white outline-none placeholder:text-white/40 focus-visible:border-white/40 focus-visible:ring-3 focus-visible:ring-white/20";
const champTextarea =
  "w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus-visible:border-white/40 focus-visible:ring-3 focus-visible:ring-white/20";

export function CharteProposal({
  onValide,
  onRefaire,
  onAnnuler,
}: {
  onValide: () => void;
  onRefaire: () => void;
  onAnnuler: () => void;
}) {
  const {
    enGeneration,
    erreurGeneration,
    charteProposee,
    genererCharte,
    validerCharte,
    modifierCharteProposee,
    supprimerEtRefaire,
    annulerProposition,
  } = useIdentity();
  const [enEdition, setEnEdition] = useState(false);
  const [brouillon, setBrouillon] = useState<ReturnType<typeof versEdition> | null>(null);

  function ouvrirEdition() {
    if (charteProposee) setBrouillon(versEdition(charteProposee));
    setEnEdition(true);
  }

  if (enGeneration) {
    return (
      <GlassPanel intensity="strong" className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 px-6 py-14 text-center">
        <Loader2 className="size-6 animate-spin text-gold" />
        <p className="text-lg font-semibold tracking-tight text-white">Analyse de vos réponses en cours…</p>
        <p className="text-sm text-white/70">Quelques secondes, le temps de composer votre charte.</p>
      </GlassPanel>
    );
  }

  if (erreurGeneration) {
    return (
      <GlassPanel intensity="strong" className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 px-6 py-10 text-center">
        <span className="flex size-9 items-center justify-center rounded-full border border-destructive/40 bg-destructive/10 text-destructive">
          <AlertTriangle className="size-4" />
        </span>
        <p className="font-medium text-white">{erreurGeneration}</p>
        <div className="mt-2 flex gap-2">
          <Button className="rounded-lg bg-gold text-white hover:bg-gold/90" onClick={() => genererCharte()}>
            Réessayer
          </Button>
          <Button
            variant="ghost"
            className="rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
            onClick={onAnnuler}
          >
            Annuler
          </Button>
        </div>
      </GlassPanel>
    );
  }

  if (!charteProposee) return null;

  function enregistrerEdition() {
    if (!brouillon || !charteProposee) return;
    const date = charteProposee.piliers[0]?.date ?? new Date().toLocaleDateString("fr-FR");
    modifierCharteProposee({
      ton: brouillon.ton,
      vocabulaire: brouillon.vocabulaire.split(",").map((v) => v.trim()).filter(Boolean),
      interdits: brouillon.interdits.split(",").map((v) => v.trim()).filter(Boolean),
      piliers: brouillon.piliers
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean)
        .map((texte, i) => ({ id: `pilier-test-edit-${Date.now()}-${i}`, texte, origine: "test" as const, date })),
    });
    setEnEdition(false);
  }

  return (
    <GlassPanel intensity="strong" className="mx-auto w-full max-w-2xl overflow-hidden p-0">
      <div className="flex items-center gap-3 border-b border-white/15 px-6 py-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-gold">
          <FileText className="size-4" />
        </span>
        <div>
          <p className="text-base font-semibold tracking-tight text-white">Charte narrative</p>
          <p className="text-xs text-white/70">À partir de vos réponses — à valider avant usage</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-6 py-5">
        {enEdition && brouillon ? (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium tracking-wide text-white/60 uppercase">Ton</label>
              <Input
                className={champInput}
                value={brouillon.ton}
                onChange={(e) => setBrouillon({ ...brouillon, ton: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium tracking-wide text-white/60 uppercase">
                Piliers d&apos;histoires (un par ligne)
              </label>
              <textarea
                value={brouillon.piliers}
                onChange={(e) => setBrouillon({ ...brouillon, piliers: e.target.value })}
                rows={4}
                className={champTextarea}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium tracking-wide text-white/60 uppercase">Vocabulaire</label>
              <Input
                className={champInput}
                value={brouillon.vocabulaire}
                onChange={(e) => setBrouillon({ ...brouillon, vocabulaire: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium tracking-wide text-white/60 uppercase">Interdits</label>
              <Input
                className={champInput}
                value={brouillon.interdits}
                onChange={(e) => setBrouillon({ ...brouillon, interdits: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button className="rounded-lg bg-gold text-white hover:bg-gold/90" onClick={enregistrerEdition}>
                Enregistrer les modifications
              </Button>
              <Button
                variant="ghost"
                className="rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
                onClick={() => setEnEdition(false)}
              >
                Annuler l&apos;édition
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-xs font-medium tracking-wide text-white/60 uppercase">Ton</p>
              <p className="mt-1.5 text-sm text-white/90">{charteProposee.ton}</p>
            </div>
            {charteProposee.piliers.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <p className="text-xs font-medium tracking-wide text-white/60 uppercase">Piliers d&apos;histoires</p>
                <ul className="mt-1.5 flex flex-col gap-1.5">
                  {charteProposee.piliers.map((p) => (
                    <li key={p.id} className="text-sm text-white/90">
                      {p.texte}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {charteProposee.vocabulaire.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <p className="text-xs font-medium tracking-wide text-white/60 uppercase">Vocabulaire</p>
                <p className="mt-1.5 text-sm text-white/90">{charteProposee.vocabulaire.join(" · ")}</p>
              </div>
            )}
            {charteProposee.interdits.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <p className="text-xs font-medium tracking-wide text-white/60 uppercase">Interdits</p>
                <p className="mt-1.5 text-sm text-white/90">{charteProposee.interdits.join(" · ")}</p>
              </div>
            )}

            <div className="mt-2 flex flex-wrap gap-2 border-t border-white/10 pt-4">
              <Button
                className="rounded-lg bg-gold text-white hover:bg-gold/90"
                onClick={() => {
                  validerCharte();
                  onValide();
                }}
              >
                <Check className="size-4" />
                Valider
              </Button>
              <Button
                variant="outline"
                className="rounded-lg border-white/30 bg-transparent text-white hover:bg-white/10"
                onClick={ouvrirEdition}
              >
                <Pencil className="size-4" />
                Modifier
              </Button>
              <Button
                variant="outline"
                className="rounded-lg border-white/30 bg-transparent text-white hover:bg-white/10"
                onClick={() => {
                  supprimerEtRefaire();
                  onRefaire();
                }}
              >
                <RotateCcw className="size-4" />
                Supprimer et refaire
              </Button>
              <Button
                variant="ghost"
                className="rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
                onClick={() => {
                  annulerProposition();
                  onAnnuler();
                }}
              >
                <X className="size-4" />
                Annuler
              </Button>
            </div>
          </>
        )}
      </div>
    </GlassPanel>
  );
}
