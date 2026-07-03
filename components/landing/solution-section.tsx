import {
  LayoutDashboard,
  Users,
  Sparkles,
  CalendarDays,
  GlassWater,
  Globe2,
  PackageSearch,
} from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/landing/reveal";

const modules = [
  {
    icon: LayoutDashboard,
    title: "Tableau de bord",
    description: "Chiffre d'affaires, stocks et activité en un coup d'œil.",
  },
  {
    icon: Users,
    title: "CRM Clients",
    description: "Fiches clients, segments et relances automatiques.",
  },
  {
    icon: Sparkles,
    title: "Studio IA",
    description: "Publications générées et validées en un clic.",
  },
  {
    icon: CalendarDays,
    title: "Calendrier éditorial",
    description: "Toute votre communication planifiée sur un mois.",
  },
  {
    icon: GlassWater,
    title: "Œnotourisme",
    description: "Réservations de visites et dégustations centralisées.",
  },
  {
    icon: Globe2,
    title: "Export & clientèle étrangère",
    description: "Fiches multilingues pour vos acheteurs internationaux.",
  },
  {
    icon: PackageSearch,
    title: "Alertes & stock cave",
    description: "Un signal avant la rupture, cuvée par cuvée.",
  },
];

export function SolutionSection() {
  return (
    <section id="solution" className="bg-vine/[0.03] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-[0.2em] text-gold uppercase">
            La solution
          </p>
          <h2 className="mt-4 font-heading text-3xl text-vine lg:text-4xl">
            Sept modules, une seule maison à piloter.
          </h2>
          <p className="mt-4 text-lg text-stone">
            Pupitre remplace le carnet, les fichiers Excel épars et les
            applications qu&apos;on n&apos;ouvre jamais.
          </p>
        </div>

        <RevealGroup className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <RevealItem
                key={module.title}
                className="group rounded-xl border border-border/70 bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-lg"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-vine/10 text-vine transition-colors duration-300 group-hover:bg-gold group-hover:text-white">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-heading text-lg text-ink">{module.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone">
                  {module.description}
                </p>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
