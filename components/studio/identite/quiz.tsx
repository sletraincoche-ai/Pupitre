"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ImagePlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageBank } from "@/components/studio/image-bank";
import { StepPills } from "@/components/studio/identite/step-pills";
import { questionsIdentite } from "@/lib/identity";
import { useIdentity } from "@/lib/identity-context";
import { cn } from "@/lib/utils";

export function IdentityQuiz({ onTermine }: { onTermine: () => void }) {
  const { etapeCourante, reponses, setReponse, setEtape, terminerQuiz } = useIdentity();
  const question = questionsIdentite[etapeCourante];
  const [brouillon, setBrouillon] = useState(reponses[question.id] ?? "");

  useEffect(() => {
    setBrouillon(reponses[questionsIdentite[etapeCourante].id] ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapeCourante]);

  const dernierePage = etapeCourante === questionsIdentite.length - 1;

  function allerA(index: number) {
    setReponse(question.id, brouillon);
    setEtape(Math.max(0, Math.min(questionsIdentite.length - 1, index)));
  }

  function suivant() {
    setReponse(question.id, brouillon);
    if (dernierePage) {
      terminerQuiz();
      onTermine();
      return;
    }
    allerA(etapeCourante + 1);
  }

  return (
    <Card className="mx-auto max-w-xl border border-border/70 bg-card shadow-none">
      <CardContent className="flex flex-col gap-6 px-6">
        <div>
          <StepPills total={questionsIdentite.length} courant={etapeCourante} />
          <p className="mt-3 text-xs font-medium tracking-wide text-gold uppercase">
            {question.groupe}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            <p className="font-heading text-xl text-ink">{question.texte}</p>

            {question.type === "texte" && (
              <Input
                className="mt-4"
                value={brouillon}
                onChange={(e) => setBrouillon(e.target.value)}
                placeholder={question.placeholder}
              />
            )}

            {question.type === "choix" && (
              <div className="mt-4 flex flex-col gap-2">
                {question.options?.map((option) => (
                  <button
                    key={option}
                    onClick={() => setBrouillon(option)}
                    className={cn(
                      "rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition-colors",
                      brouillon === option
                        ? "border-vine bg-vine text-white"
                        : "border-border bg-background text-ink hover:border-vine/40"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {question.type === "photos" && (
              <div className="mt-4">
                <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-gold">
                  <ImagePlus className="size-4" />
                  Facultatif — vous pourrez toujours en ajouter plus tard
                </p>
                <ImageBank />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between border-t border-border/60 pt-5">
          <Button variant="ghost" onClick={() => allerA(etapeCourante - 1)} disabled={etapeCourante === 0}>
            <ArrowLeft className="size-4" />
            Précédent
          </Button>
          <Button className="bg-vine text-white hover:bg-vine/90" onClick={suivant}>
            {dernierePage ? "Terminer" : "Suivant"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
