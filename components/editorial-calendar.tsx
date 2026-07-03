import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { calendrierJuillet, type ContenuStudio } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const joursSemaine = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const platformDot: Record<ContenuStudio["plateforme"], string> = {
  Instagram: "bg-gold",
  Email: "bg-vine",
  "Avis Google": "bg-destructive",
};

function buildJuillet2026() {
  const totalJours = 31;
  const premierJourSemaine = new Date(2026, 6, 1).getDay(); // 0 = dimanche
  const decalage = (premierJourSemaine + 6) % 7; // 0 = lundi

  const cellules: (number | null)[] = Array(decalage).fill(null);
  for (let jour = 1; jour <= totalJours; jour++) cellules.push(jour);
  while (cellules.length % 7 !== 0) cellules.push(null);
  return cellules;
}

export function EditorialCalendar() {
  const cellules = buildJuillet2026();
  const evenementsParJour = new Map(
    calendrierJuillet.map((e) => [e.jour, e])
  );

  return (
    <Card className="border border-border/70 bg-card shadow-none">
      <CardHeader className="px-6">
        <CardTitle>Calendrier éditorial — Juillet 2026</CardTitle>
        <CardDescription>
          Un point par jour planifié sur vos canaux
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-stone">
          {joursSemaine.map((jour) => (
            <div key={jour} className="pb-1 font-medium">
              {jour}
            </div>
          ))}
          {cellules.map((jour, index) => {
            const evenement = jour ? evenementsParJour.get(jour) : undefined;
            return (
              <div
                key={index}
                title={evenement ? `${jour} juillet — ${evenement.titre}` : undefined}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center gap-1 rounded-md text-[0.75rem]",
                  jour ? "text-ink" : "text-transparent"
                )}
              >
                <span>{jour ?? "·"}</span>
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    evenement ? platformDot[evenement.plateforme] : "bg-transparent"
                  )}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-4 border-t border-border/60 pt-4 text-xs text-stone">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-gold" /> Instagram
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-vine" /> Email
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-destructive" /> Avis Google
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
