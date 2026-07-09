"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassBackground } from "@/components/glass/glass-background";
import { GlassPanel } from "@/components/glass/glass-panel";
import { GlassImageBank } from "@/components/studio/glass-image-bank";
import { QuizProgress } from "@/components/studio/identite/quiz-progress";
import { QuizMotif } from "@/components/studio/identite/quiz-motifs";
import { questionsIdentite } from "@/lib/identity";
import { useIdentity } from "@/lib/identity-context";
import { cn } from "@/lib/utils";

// Le test reste un écran isolé, sans chrome de dashboard (pas de barre de
// recherche, pas de menu latéral, pas de notifications) — seule
// l'interface du test doit être visible pendant qu'il est en cours.
// Habillage repris du système Liquid Glass déjà en place ailleurs dans le
// Studio : même photo de fond, mêmes panneaux de verre, même typographie
// sans-serif (plus de serif/italique hérité de l'ancienne version claire).
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
    <div className="fixed inset-0 z-40 overflow-hidden">
      <GlassBackground src="/images/glass/vignoble.jpg" alt="Vigne à contre-jour" />

      <div className="relative flex h-full flex-col">
        <div className="flex shrink-0 items-center justify-between gap-3 p-4 lg:px-8 lg:py-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-4 py-2 text-white backdrop-blur-xl backdrop-saturate-150"
          >
            <Wine className="size-4 text-gold" />
            <span className="font-semibold tracking-tight">Pupitre</span>
          </Link>
          <div className="rounded-full border border-white/15 bg-black/50 px-4 py-2 text-sm text-white/80 backdrop-blur-xl backdrop-saturate-150">
            Studio <span className="mx-1.5 text-white/40">/</span>
            <span className="font-medium text-white">Identité</span>
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center overflow-y-auto px-6 py-6 lg:px-12">
          <QuizMotif
            groupe={question.groupe}
            className="pointer-events-none absolute top-8 right-8 hidden size-40 text-white/20 lg:block"
          />

          <GlassPanel intensity="strong" className="w-full max-w-xl p-8">
            <QuizProgress total={questionsIdentite.length} courant={etapeCourante} />

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
                <p className="mt-3 text-2xl leading-snug font-semibold tracking-tight text-white lg:text-3xl">
                  {question.texte}
                </p>

                {question.type === "texte" && (
                  <input
                    value={brouillon}
                    onChange={(e) => setBrouillon(e.target.value)}
                    placeholder={question.placeholder}
                    className="mt-8 w-full border-b border-white/40 bg-transparent pb-2 text-lg text-white outline-none placeholder:text-white/35 focus-visible:border-gold"
                  />
                )}

                {question.type === "choix" && (
                  <div className="mt-8 flex flex-col gap-2">
                    {question.options?.map((option) => (
                      <button
                        key={option}
                        onClick={() => setBrouillon(option)}
                        className={cn(
                          "rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors",
                          brouillon === option
                            ? "border-white/40 bg-white/15 text-white"
                            : "border-white/20 bg-white/5 text-white/80 hover:border-white/35"
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
                    <GlassImageBank />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-between border-t border-white/15 pt-5">
              <button
                onClick={() => allerA(etapeCourante - 1)}
                disabled={etapeCourante === 0}
                className="text-sm text-white/70 hover:text-white disabled:pointer-events-none disabled:opacity-30"
              >
                ← Précédent
              </button>
              <div className="flex items-center gap-5">
                {question.type !== "photos" && (
                  <button
                    onClick={() => soumettre("")}
                    className="text-sm text-white/70 hover:text-white"
                  >
                    Passer
                  </button>
                )}
                <Button
                  variant="outline"
                  className="rounded-lg border-white/30 text-white hover:bg-white/10"
                  onClick={() => soumettre(brouillon)}
                >
                  {dernierePage ? "Terminer" : "Suivant →"}
                </Button>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
