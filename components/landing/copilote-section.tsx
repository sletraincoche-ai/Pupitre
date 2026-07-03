import { Sparkles, PenLine, Eye, Check } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";

const steps = [
  {
    icon: PenLine,
    title: "L'IA rédige",
    description:
      "En s'appuyant sur votre cuvée, votre saison et votre ton, Pupitre rédige un post, une newsletter ou une fiche produit prête à l'emploi.",
  },
  {
    icon: Eye,
    title: "Vous relisez",
    description:
      "Chaque texte arrive dans votre file de validation, avec la date de publication proposée. Rien ne part sans votre accord.",
  },
  {
    icon: Check,
    title: "Vous validez en un clic",
    description:
      "Un bouton pour publier, un pour retoucher, un pour ignorer. Trois secondes de votre temps, pas trois heures.",
  },
];

export function CopiloteSection() {
  return (
    <section id="copilote" className="bg-vine py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="flex items-center gap-2 text-sm font-medium tracking-[0.2em] text-gold uppercase">
              <Sparkles className="size-4" />
              Copilote IA
            </p>
            <h2 className="mt-4 font-heading text-3xl lg:text-4xl">
              Votre communication, écrite par l&apos;IA, décidée par vous.
            </h2>
            <p className="mt-4 max-w-lg text-white/70">
              Pupitre ne publie jamais rien en votre nom sans passer devant
              vous. Le Studio IA propose, vous disposez — en un clic depuis
              votre téléphone, entre deux rangs.
            </p>

            <div className="mt-10 flex flex-col gap-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-gold">
                        <Icon className="size-4" />
                      </span>
                      {index < steps.length - 1 && (
                        <span className="mt-2 h-full w-px flex-1 bg-white/15" />
                      )}
                    </div>
                    <div className="pb-2">
                      <h3 className="font-heading text-lg">{step.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-full bg-gold/20 text-gold">
                    <Sparkles className="size-4" />
                  </span>
                  <span className="text-sm font-medium">Instagram</span>
                </div>
                <span className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-white/60">
                  Prévu le 12 juillet
                </span>
              </div>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-white/85">
                Portrait de vigneron 🍇 Trois générations, une même exigence :
                celle du geste juste à chaque étape de l&apos;élaboration.
              </p>
              <div className="mt-5 flex gap-2">
                <span className="flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-white">
                  <Check className="size-3.5" />
                  Valider
                </span>
                <span className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/70">
                  Modifier
                </span>
                <span className="rounded-lg px-4 py-2 text-sm text-white/40">
                  Ignorer
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
