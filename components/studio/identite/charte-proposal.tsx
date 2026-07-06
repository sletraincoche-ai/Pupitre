"use client";

import { useState } from "react";
import { Loader2, Sparkles, Check, Pencil, RotateCcw, X, AlertTriangle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      <Card className="mx-auto max-w-xl border border-border/70 bg-card shadow-none">
        <CardContent className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <Loader2 className="size-7 animate-spin text-vine" />
          <p className="font-heading text-lg text-ink">Analyse de vos réponses en cours…</p>
          <p className="text-sm text-stone">Quelques secondes, le temps que l&apos;IA compose votre charte.</p>
        </CardContent>
      </Card>
    );
  }

  if (erreurGeneration) {
    return (
      <Card className="mx-auto max-w-xl border border-destructive/30 bg-card shadow-none">
        <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" />
          </span>
          <p className="font-medium text-ink">{erreurGeneration}</p>
          <div className="mt-2 flex gap-2">
            <Button className="bg-vine text-white hover:bg-vine/90" onClick={() => genererCharte()}>
              Réessayer
            </Button>
            <Button variant="ghost" onClick={onAnnuler}>
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
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
    <Card className="mx-auto max-w-xl border border-border/70 bg-card shadow-none">
      <CardHeader className="px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-gold/10 text-gold">
            <Sparkles className="size-4" />
          </span>
          <div>
            <CardTitle>Votre charte narrative</CardTitle>
            <CardDescription>Générée par l&apos;IA à partir de vos réponses — à valider avant usage</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-6">
        {enEdition && brouillon ? (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium tracking-wide text-stone uppercase">Ton</label>
              <Input value={brouillon.ton} onChange={(e) => setBrouillon({ ...brouillon, ton: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium tracking-wide text-stone uppercase">
                Piliers d&apos;histoires (un par ligne)
              </label>
              <textarea
                value={brouillon.piliers}
                onChange={(e) => setBrouillon({ ...brouillon, piliers: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-ink outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium tracking-wide text-stone uppercase">Vocabulaire</label>
              <Input
                value={brouillon.vocabulaire}
                onChange={(e) => setBrouillon({ ...brouillon, vocabulaire: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium tracking-wide text-stone uppercase">Interdits</label>
              <Input
                value={brouillon.interdits}
                onChange={(e) => setBrouillon({ ...brouillon, interdits: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button className="bg-vine text-white hover:bg-vine/90" onClick={enregistrerEdition}>
                Enregistrer les modifications
              </Button>
              <Button variant="ghost" onClick={() => setEnEdition(false)}>
                Annuler l&apos;édition
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-xs font-medium tracking-wide text-stone uppercase">Ton</p>
              <p className="mt-1 text-sm text-ink">{charteProposee.ton}</p>
            </div>
            {charteProposee.piliers.length > 0 && (
              <div>
                <p className="text-xs font-medium tracking-wide text-stone uppercase">Piliers d&apos;histoires</p>
                <ul className="mt-1 flex flex-col gap-1">
                  {charteProposee.piliers.map((p) => (
                    <li key={p.id} className="text-sm text-ink">
                      {p.texte}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {charteProposee.vocabulaire.length > 0 && (
              <div>
                <p className="text-xs font-medium tracking-wide text-stone uppercase">Vocabulaire</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {charteProposee.vocabulaire.map((v) => (
                    <Badge key={v} variant="outline" className="border-vine/30 text-vine">
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {charteProposee.interdits.length > 0 && (
              <div>
                <p className="text-xs font-medium tracking-wide text-stone uppercase">Interdits</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {charteProposee.interdits.map((i) => (
                    <Badge key={i} variant="outline" className="border-destructive/30 text-destructive">
                      {i}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-2 flex flex-wrap gap-2 border-t border-border/60 pt-4">
              <Button
                className="bg-vine text-white hover:bg-vine/90"
                onClick={() => {
                  validerCharte();
                  onValide();
                }}
              >
                <Check className="size-4" />
                Valider
              </Button>
              <Button variant="outline" onClick={ouvrirEdition}>
                <Pencil className="size-4" />
                Modifier
              </Button>
              <Button
                variant="outline"
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
                className="text-stone"
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
      </CardContent>
    </Card>
  );
}
