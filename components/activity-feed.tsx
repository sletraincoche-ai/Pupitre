import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { activites, type ActiviteType } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const pastilleColors: Record<ActiviteType, string> = {
  reservation: "bg-vine",
  vente: "bg-gold",
  contenu: "bg-gold",
  avis: "bg-vine",
  systeme: "bg-stone",
};

export function ActivityFeed() {
  return (
    <Card className="border border-border/70 bg-card shadow-none">
      <CardHeader className="px-6">
        <CardTitle>Activité récente</CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <ul className="flex flex-col gap-4">
          {activites.map((activite) => (
            <li key={activite.id} className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  pastilleColors[activite.type]
                )}
              />
              <div>
                <p className="text-sm text-ink">{activite.texte}</p>
                <p className="mt-0.5 text-xs text-stone">{activite.temps}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
