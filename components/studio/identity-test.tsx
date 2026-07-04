"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, ArrowLeft, ArrowRight } from "lucide-react";
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
import type { CharteNarrative } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const tons = [
  "Chaleureux et familial",
  "Élégant et feutré",
  "Direct et sans détour",
  "Poétique et sensoriel",
];

type Reponses = {
  ton: string;
  anecdote: string;
  pilier: string;
  interdits: string;
  vocabulaire: string;
};

const reponsesVides: Reponses = { ton: "", anecdote: "", pilier: "", interdits: "", vocabulaire: "" };

const questions = [
  { cle: "ton" as const, label: "Quel ton représente le mieux votre domaine ?", type: "choix" as const },
  { cle: "anecdote" as const, label: "Racontez une anecdote fondatrice de votre domaine.", type: "texte" as const },
  { cle: "pilier" as const, label: "Qu'est-ce qui rend votre domaine différent, en une phrase ?", type: "texte" as const },
  { cle: "vocabulaire" as const, label: "Trois mots qui reviennent quand vous décrivez vos cuvées (séparés par des virgules).", type: "texte" as const },
  { cle: "interdits" as const, label: "Une expression que vous n'utilisez jamais pour parler de votre champagne.", type: "texte" as const },
];

function construireCharte(reponses: Reponses): CharteNarrative {
  return {
    ton: reponses.ton || tons[0],
    piliers: [reponses.anecdote, reponses.pilier].filter(Boolean),
    vocabulaire: reponses.vocabulaire.split(",").map((m) => m.trim()).filter(Boolean),
    interdits: reponses.interdits.split(",").map((m) => m.trim()).filter(Boolean),
  };
}

export function IdentityTest() {
  const [charte, setCharte] = useState<CharteNarrative | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [etape, setEtape] = useState(0);
  const [reponses, setReponses] = useState<Reponses>(reponsesVides);

  const question = questions[etape];
  const peutContinuer = reponses[question.cle].trim().length > 0;

  function suivant() {
    if (etape < questions.length - 1) {
      setEtape((e) => e + 1);
      return;
    }
    setCharte(construireCharte(reponses));
    setEnCours(false);
    setEtape(0);
    toast.success("Charte narrative enregistrée", {
      description: "Chaque génération du Studio s'appuiera désormais dessus.",
    });
  }

  function precedent() {
    setEtape((e) => Math.max(0, e - 1));
  }

  function commencer() {
    setReponses(reponsesVides);
    setEtape(0);
    setEnCours(true);
  }

  if (enCours) {
    return (
      <Card className="mx-auto max-w-xl border border-border/70 bg-card shadow-none">
        <CardHeader className="px-6">
          <Badge variant="outline" className="w-fit border-gold/40 text-gold">
            Question {etape + 1} / {questions.length}
          </Badge>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gold transition-all"
              style={{ width: `${((etape + 1) / questions.length) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="px-6">
          <p className="font-heading text-xl text-ink">{question.label}</p>

          {question.type === "choix" ? (
            <div className="mt-4 flex flex-col gap-2">
              {tons.map((t) => (
                <button
                  key={t}
                  onClick={() => setReponses((r) => ({ ...r, ton: t }))}
                  className={cn(
                    "rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition-colors",
                    reponses.ton === t
                      ? "border-vine bg-vine text-white"
                      : "border-border bg-background text-ink hover:border-vine/40"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          ) : (
            <Input
              className="mt-4"
              value={reponses[question.cle]}
              onChange={(e) => setReponses((r) => ({ ...r, [question.cle]: e.target.value }))}
              placeholder="Votre réponse"
            />
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={etape === 0 ? () => setEnCours(false) : precedent}>
              <ArrowLeft className="size-4" />
              {etape === 0 ? "Annuler" : "Précédent"}
            </Button>
            <Button
              className="bg-vine text-white hover:bg-vine/90"
              disabled={!peutContinuer}
              onClick={suivant}
            >
              {etape === questions.length - 1 ? "Terminer" : "Suivant"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!charte) {
    return (
      <Card className="mx-auto max-w-xl border border-border/70 bg-card shadow-none">
        <CardContent className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-gold/10 text-gold">
            <Sparkles className="size-6" />
          </span>
          <div>
            <p className="font-heading text-xl text-ink">Testez votre identité éditoriale</p>
            <p className="mt-2 max-w-sm text-sm text-stone">
              15 à 20 minutes, 5 questions. Non obligatoire, mais fortement recommandé : c&apos;est
              ce qui rend chaque génération du Studio crédible sous votre nom.
            </p>
          </div>
          <Button className="bg-gold text-white hover:bg-gold/90" onClick={commencer}>
            Commencer le test
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-xl border border-border/70 bg-card shadow-none">
      <CardHeader className="px-6">
        <CardTitle>Votre charte narrative</CardTitle>
        <CardDescription>Utilisée pour chaque génération du Studio IA</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-6">
        <div>
          <p className="text-xs font-medium tracking-wide text-stone uppercase">Ton</p>
          <p className="mt-1 text-sm text-ink">{charte.ton}</p>
        </div>
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
            <p className="text-xs font-medium tracking-wide text-stone uppercase">
              Interdits
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {charte.interdits.map((i) => (
                <Badge key={i} variant="outline" className="border-destructive/30 text-destructive">
                  {i}
                </Badge>
              ))}
            </div>
          </div>
        )}
        <Button variant="outline" className="mt-2 self-start" onClick={commencer}>
          Modifier
        </Button>
        <p className="text-xs text-stone">Également modifiable depuis les Paramètres.</p>
      </CardContent>
    </Card>
  );
}
