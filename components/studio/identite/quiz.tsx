"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ImagePlus, SkipForward, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageBank } from "@/components/studio/image-bank";
import { StepPills } from "@/components/studio/identite/step-pills";
import { QuizIllustration } from "@/components/studio/identite/quiz-illustration";
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
      <QuizIllustration etapeIndex={etapeCourante} />

      {/* Voile crème : plein et uni sur mobile (une seule colonne, pas
          d'espace pour "éviter" le fond), dégradé gauche→droite sur
          desktop pour laisser le fond respirer à droite. */}
      <div className="pointer-events-none absolute inset-0 bg-background/85 lg:hidden" />
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background: "linear-gradient(to right, #F5F0E8 0%, #F5F0E8 40%, rgba(245,240,232,0) 78%)",
        }}
      />

      <div className="relative z-10 flex shrink-0 items-center justify-between bg-background/60 px-6 py-4 backdrop-blur-[2px] lg:px-12">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Wine className="size-5 text-gold" />
          <span className="font-heading text-xl tracking-wide text-vine">PUPITRE</span>
        </Link>
        <p className="text-sm text-stone">
          Studio IA <span className="mx-1.5 text-border">/</span>
          <span className="font-medium text-ink">Identité</span>
        </p>
      </div>

      <div className="relative z-10 flex flex-1 items-center">
        <div className="w-full px-6 py-10 lg:w-1/2 lg:px-12">
          <StepPills total={questionsIdentite.length} courant={etapeCourante} />

          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="mt-8"
            >
              <p className="text-xs font-semibold tracking-[0.15em] text-gold uppercase">
                {question.groupe}
              </p>
              <p className="mt-3 font-heading text-3xl leading-snug text-ink italic lg:text-4xl">
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

          <div className="mt-12 flex items-center justify-between">
            <Button variant="ghost" onClick={() => allerA(etapeCourante - 1)} disabled={etapeCourante === 0}>
              <ArrowLeft className="size-4" />
              Précédent
            </Button>
            <div className="flex items-center gap-2">
              {question.type !== "photos" && (
                <Button variant="ghost" className="text-stone" onClick={() => soumettre("")}>
                  <SkipForward className="size-4" />
                  Passer
                </Button>
              )}
              <Button className="bg-vine text-white hover:bg-vine/90" onClick={() => soumettre(brouillon)}>
                {dernierePage ? "Terminer" : "Suivant"}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
