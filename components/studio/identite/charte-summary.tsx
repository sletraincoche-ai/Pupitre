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
        <div>
          <p className="text-xs font-medium tracking-wide text-stone uppercase">Ton</p>
          <p className="mt-1 text-sm text-ink">{charte.ton}</p>
        </div>

        {charte.piliers.length > 0 && (
          <div>
            <p className="text-xs font-medium tracking-wide text-stone uppercase">
              Piliers d&apos;histoires
            </p>
            <ul className="mt-1 flex flex-col gap-1">
              {charte.piliers.map((p) => (
                <li key={p} className="text-sm text-ink">
                  {p}
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
