import { PenLine, Wand2, CheckCircle2, ArrowRight } from "lucide-react";
import { GlassPanel } from "@/components/glass/glass-panel";
import { GlassSheen } from "@/components/glass/glass-sheen";
import { Button } from "@/components/ui/button";

const etapes = [
  {
    icon: PenLine,
    titre: "Racontez votre histoire",
    texte: "12 questions, 15 minutes.",
  },
  {
    icon: Wand2,
    titre: "L'IA génère",
    texte: "Posts, emails, réponses — dans votre voix.",
  },
  {
    icon: CheckCircle2,
    titre: "Vous validez",
    texte: "Rien ne part sans votre clic.",
  },
];

export function ExplicationScreen({ onCommencer }: { onCommencer: () => void }) {
  return (
    <GlassPanel intensity="strong" className="relative mx-auto max-w-2xl overflow-hidden">
      <GlassSheen />
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 py-10 text-center">
        <div>
          <p className="font-heading text-2xl text-white">Bienvenu sur Studio AI</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">
            En quelques minutes, transformez un travail qui vous prenait des heures chaque semaine en
            quelques clics par jour.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {etapes.map((etape, index) => {
            const Icon = etape.icon;
            return (
              <div key={etape.titre} className="flex flex-col items-center gap-2">
                <span className="flex size-14 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <Icon className="size-6" />
                </span>
                <p className="font-heading text-base text-white">
                  {index + 1}. {etape.titre}
                </p>
                <p className="text-xs text-white/60">{etape.texte}</p>
              </div>
            );
          })}
        </div>

        <Button className="bg-gold text-white hover:bg-gold/90" onClick={onCommencer}>
          Commencer
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </GlassPanel>
  );
}
