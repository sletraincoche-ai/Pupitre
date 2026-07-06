"use client";

import { Sparkles } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIdentity } from "@/lib/identity-context";
import type { OrigineEnrichissement } from "@/lib/mock-data";

const libellesOrigine: Record<OrigineEnrichissement, string> = {
  test: "Test initial",
  saison: "Saison",
  cuvee: "Nouvelle cuvée",
  visite: "Visite",
};

const stylesOrigine: Record<OrigineEnrichissement, string> = {
  test: "border-vine/30 text-vine",
  saison: "border-gold/40 text-gold",
  cuvee: "border-[#5C7A99]/40 text-[#5C7A99]",
  visite: "border-destructive/30 text-destructive",
};

export function CharteSummary({ onModifier }: { onModifier: () => void }) {
  const { charte } = useIdentity();
  if (!charte) return null;

  return (
    <Card className="mx-auto max-w-xl border border-border/70 bg-card shadow-none">
      <CardHeader className="px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-gold/10 text-gold">
            <Sparkles className="size-4" />
          </span>
          <div>
            <CardTitle>Votre charte narrative</CardTitle>
            <CardDescription>Utilisée pour chaque génération du Studio IA</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-6">
        {charte.ton && (
          <div>
            <p className="text-xs font-medium tracking-wide text-stone uppercase">Ton</p>
            <p className="mt-1 text-sm text-ink">{charte.ton}</p>
          </div>
        )}

        {charte.piliers.length > 0 && (
          <div>
            <p className="text-xs font-medium tracking-wide text-stone uppercase">
              Piliers d&apos;histoires ({charte.piliers.length})
            </p>
            <ul className="mt-2 flex flex-col gap-2.5">
              {charte.piliers.map((p) => (
                <li key={p.id} className="text-sm text-ink">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant="outline" className={stylesOrigine[p.origine]}>
                      {libellesOrigine[p.origine]}
                    </Badge>
                    <span className="text-xs text-stone">{p.date}</span>
                  </div>
                  {p.texte}
                </li>
              ))}
            </ul>
          </div>
        )}

        {charte.vocabulaire.length > 0 && (
          <div>
            <p className="text-xs font-medium tracking-wide text-stone uppercase">Vocabulaire</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {charte.vocabulaire.map((v) => (
                <Badge key={v} variant="outline" className="border-vine/30 text-vine">
                  {v}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {charte.interdits.length > 0 && (
          <div>
            <p className="text-xs font-medium tracking-wide text-stone uppercase">Interdits</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {charte.interdits.map((i) => (
                <Badge key={i} variant="outline" className="border-destructive/30 text-destructive">
                  {i}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button variant="outline" className="mt-2 self-start" onClick={onModifier}>
          Modifier mes réponses
        </Button>
      </CardContent>
    </Card>
  );
}
