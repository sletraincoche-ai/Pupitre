import { PenLine, Wand2, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="mx-auto max-w-2xl border border-border/70 bg-card shadow-none">
      <CardContent className="flex flex-col items-center gap-8 px-6 py-10 text-center">
        <div>
          <p className="font-heading text-2xl text-ink">Bienvenue dans votre Studio</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-stone">
            En quelques minutes, transformez un travail qui vous prenait des heures chaque semaine en
            quelques clics par jour.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {etapes.map((etape, index) => {
            const Icon = etape.icon;
            return (
              <div key={etape.titre} className="flex flex-col items-center gap-2">
                <span className="flex size-14 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <Icon className="size-6" />
                </span>
                <p className="font-heading text-base text-ink">
                  {index + 1}. {etape.titre}
                </p>
                <p className="text-xs text-stone">{etape.texte}</p>
              </div>
            );
          })}
        </div>

        <Button className="bg-gold text-white hover:bg-gold/90" onClick={onCommencer}>
          Commencer
          <ArrowRight className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
