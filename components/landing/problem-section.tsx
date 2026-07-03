import { Globe2, Frown, Clock, TrendingDown } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/landing/reveal";

const pains = [
  {
    icon: Globe2,
    title: "Les clients étrangers vous échappent",
    description:
      "Un amateur belge, japonais ou américain découvre votre cuvée en visite, puis repart. Sans présence en ligne sérieuse, il ne vous retrouve jamais pour une deuxième commande.",
  },
  {
    icon: Frown,
    title: "Le digital, un métier que vous n'avez pas appris",
    description:
      "Une page Facebook ouverte en 2019, jamais mise à jour. Un site vitrine payé cher, invisible sur Google. Vous savez faire du grand vin, pas du community management.",
  },
  {
    icon: Clock,
    title: "Le temps manque, tout simplement",
    description:
      "Entre la vigne, les vendanges et le chai, il ne reste plus une heure pour relancer un client, répondre à un mail ou publier une photo des rangs en fleur.",
  },
  {
    icon: TrendingDown,
    title: "Un marché de plus en plus tendu",
    description:
      "La grande distribution négocie les prix à la baisse, les maisons rachètent les hectares. Vendre en direct et fidéliser sa clientèle n'est plus une option, c'est une nécessité.",
  },
];

export function ProblemSection() {
  return (
    <section id="probleme" className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-[0.2em] text-gold uppercase">
            Le constat
          </p>
          <h2 className="mt-4 font-heading text-3xl text-vine lg:text-4xl">
            Vous faites un vin d&apos;exception. Votre gestion client, elle,
            tient sur un carnet.
          </h2>
        </div>

        <RevealGroup className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {pains.map((pain) => {
            const Icon = pain.icon;
            return (
              <RevealItem
                key={pain.title}
                className="rounded-xl border border-border/70 bg-card p-8 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-heading text-xl text-ink">{pain.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-stone">
                  {pain.description}
                </p>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
