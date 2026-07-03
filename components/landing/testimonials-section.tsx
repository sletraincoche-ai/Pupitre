import { Quote } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/landing/reveal";

// Noms, domaines et citations fictifs, à but illustratif uniquement.
const testimonials = [
  {
    quote:
      "Je pensais que le digital, c'était pour les grosses maisons. Pupitre m'a prouvé le contraire — mes ventes à l'export ont doublé en un an.",
    nom: "Étienne Rocher",
    domaine: "Domaine du Clos Rocher",
    lieu: "Aÿ-Champagne",
    initiales: "ER",
  },
  {
    quote:
      "Le Studio IA m'a fait gagner un temps fou. Je valide trois publications le dimanche soir, et ma page vit toute la semaine sans que j'y touche.",
    nom: "Sylvie Angevin",
    domaine: "Vignoble Angevin",
    lieu: "Verzenay",
    initiales: "SA",
  },
  {
    quote:
      "Enfin un outil pensé pour un vigneron, pas pour un développeur. Dix minutes par semaine, pas plus, et mes clients dormants reviennent.",
    nom: "Thierry Delombre",
    domaine: "Clos Delombre",
    lieu: "Vertus",
    initiales: "TD",
  },
];

export function TestimonialsSection() {
  return (
    <section id="temoignages" className="bg-vine/[0.03] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-[0.2em] text-gold uppercase">
            Ils pilotent avec Pupitre
          </p>
          <h2 className="mt-4 font-heading text-3xl text-vine lg:text-4xl">
            Des vignerons, pas des influenceurs.
          </h2>
        </div>

        <RevealGroup className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <RevealItem
              key={t.nom}
              className="flex flex-col rounded-xl border border-border/70 bg-card p-8 transition-shadow hover:shadow-md"
            >
              <Quote className="size-7 text-gold/60" />
              <p className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-ink">
                {t.quote}
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-vine/10 text-sm font-medium text-vine">
                  {t.initiales}
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{t.nom}</p>
                  <p className="text-xs text-stone">
                    {t.domaine} · {t.lieu}
                  </p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
