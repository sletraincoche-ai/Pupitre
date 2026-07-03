"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevealGroup, RevealItem } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Carnet",
    price: "49",
    tagline: "Pour digitaliser l'essentiel",
    features: [
      "CRM clients illimité",
      "Tableau de bord",
      "Segments et relances",
      "Support par e-mail",
    ],
    highlighted: false,
  },
  {
    name: "Pupitre",
    price: "99",
    tagline: "Le pilote complet de la maison",
    features: [
      "Tout Carnet, plus :",
      "Studio IA & calendrier éditorial",
      "Œnotourisme illimité",
      "Alertes de stock cave",
      "Support prioritaire",
    ],
    highlighted: true,
  },
  {
    name: "Grande Cuvée",
    price: "149",
    tagline: "Pour viser l'export",
    features: [
      "Tout Pupitre, plus :",
      "Fiches multilingues export",
      "Accompagnement dédié",
      "Intégration comptable",
      "Accès prioritaire aux nouveautés",
    ],
    highlighted: false,
  },
];

function scrollToCta() {
  document.querySelector("#cta")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function PricingSection() {
  return (
    <section id="pricing" className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-medium tracking-[0.2em] text-gold uppercase">
            Tarifs
          </p>
          <h2 className="mt-4 font-heading text-3xl text-vine lg:text-4xl">
            Un prix simple, sans commission sur vos ventes.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-stone">
            Sans engagement. Résiliable en un clic depuis votre pilote.
          </p>
        </div>

        <RevealGroup className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <RevealItem
              key={tier.name}
              className={cn(
                "relative flex flex-col rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1",
                tier.highlighted
                  ? "border-gold bg-vine text-white shadow-xl lg:scale-105"
                  : "border-border/70 bg-card hover:shadow-md"
              )}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-xs font-medium tracking-wide text-white">
                  Recommandé
                </span>
              )}
              <h3
                className={cn(
                  "font-heading text-2xl",
                  tier.highlighted ? "text-white" : "text-ink"
                )}
              >
                {tier.name}
              </h3>
              <p className={cn("mt-1 text-sm", tier.highlighted ? "text-white/70" : "text-stone")}>
                {tier.tagline}
              </p>
              <p className="mt-6">
                <span className={cn("font-heading text-4xl", tier.highlighted ? "text-gold" : "text-ink")}>
                  {tier.price} €
                </span>
                <span className={cn("text-sm", tier.highlighted ? "text-white/60" : "text-stone")}>
                  {" "}
                  / mois
                </span>
              </p>

              <ul className="mt-8 flex flex-1 flex-col gap-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className={cn(
                      "flex items-start gap-2 text-sm",
                      tier.highlighted ? "text-white/85" : "text-stone",
                      feature.endsWith(":") && "font-medium text-inherit opacity-80"
                    )}
                  >
                    {!feature.endsWith(":") && (
                      <Check
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          tier.highlighted ? "text-gold" : "text-vine"
                        )}
                      />
                    )}
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={scrollToCta}
                className={cn(
                  "mt-8 h-11",
                  tier.highlighted
                    ? "bg-gold text-white hover:bg-gold/90"
                    : "bg-vine text-white hover:bg-vine/90"
                )}
              >
                Demander un accès pilote
              </Button>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
