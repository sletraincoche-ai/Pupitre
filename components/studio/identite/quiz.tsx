"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageBank } from "@/components/studio/image-bank";
import { QuizProgress } from "@/components/studio/identite/quiz-progress";
import { QuizMotif } from "@/components/studio/identite/quiz-motifs";
import { questionsIdentite } from "@/lib/identity";
import { useIdentity } from "@/lib/identity-context";
import { cn } from "@/lib/utils";

export function IdentityQuiz({ onTermine }: { onTermine: () => void }) {
  const { etapeCourante, reponses, setReponse, setEtape } = useIdentity();
  const question = questionsIdentite[etapeCourante];
  const [brouillon, setBrouillon] = useState(reponses[question.id] ?? "");

  useEffect(() => {
    setBrouillon(reponses[questionsIdentite[etapeCourante].id] ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapeCourante]);

  const dernierePage = etapeCourante === questionsIdentite.length - 1;

  function allerA(index: number) {
    setEtape(Math.max(0, Math.min(questionsIdentite.length - 1, index)));
  }

  function soumettre(valeur: string) {
    setReponse(question.id, valeur);
    if (dernierePage) {
      onTermine();
      return;
    }
    allerA(etapeCourante + 1);
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-background">
      <div className="flex shrink-0 items-center justify-between px-6 py-4 lg:px-12">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Wine className="size-5 text-gold" />
          <span className="font-heading text-xl tracking-wide text-vine">PUPITRE</span>
        </Link>
        <p className="text-sm text-stone">
          Studio <span className="mx-1.5 text-border">/</span>
          <span className="font-medium text-ink">Identité</span>
        </p>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-6 py-10 lg:px-12">
        <QuizMotif
          groupe={question.groupe}
          className="pointer-events-none absolute top-8 right-8 hidden size-40 text-vine opacity-[0.16] lg:block"
        />

        <div className="w-full max-w-xl">
          <QuizProgress total={questionsIdentite.length} courant={etapeCourante} />

          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="mt-10"
            >
              <p className="text-xs font-semibold tracking-[0.15em] text-gold uppercase">
                {question.groupe}
              </p>
              <p className="mt-3 font-heading text-3xl leading-snug text-ink lg:text-4xl">
                {question.texte}
              </p>

              {question.type === "texte" && (
                <input
                  value={brouillon}
                  onChange={(e) => setBrouillon(e.target.value)}
                  placeholder={question.placeholder}
                  className="mt-8 w-full border-b border-ink/70 bg-transparent pb-2 text-lg text-ink outline-none placeholder:text-stone/60 focus-visible:border-vine"
                />
              )}

              {question.type === "choix" && (
                <div className="mt-8 flex flex-col gap-2">
                  {question.options?.map((option) => (
                    <button
                      key={option}
                      onClick={() => setBrouillon(option)}
                      className={cn(
                        "rounded-[3px] border px-4 py-2.5 text-left text-sm font-medium transition-colors",
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
                <div className="mt-8">
                  <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-gold">
                    <ImagePlus className="size-4" />
                    Facultatif — vous pourrez toujours en ajouter plus tard
                  </p>
                  <ImageBank />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex items-center justify-between border-t border-border pt-5">
            <button
              onClick={() => allerA(etapeCourante - 1)}
              disabled={etapeCourante === 0}
              className="text-sm text-stone hover:text-ink disabled:pointer-events-none disabled:opacity-30"
            >
              ← Précédent
            </button>
            <div className="flex items-center gap-5">
              {question.type !== "photos" && (
                <button
                  onClick={() => soumettre("")}
                  className="text-sm text-stone hover:text-ink"
                >
                  Passer
                </button>
              )}
              <Button
                variant="outline"
                className="rounded-[3px] border-ink text-ink hover:bg-ink hover:text-background"
                onClick={() => soumettre(brouillon)}
              >
                {dernierePage ? "Terminer" : "Suivant →"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
