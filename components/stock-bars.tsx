import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { cuvees, mouvements } from "@/lib/mock-data";
import { getStockCalcule, type StockCuveeCalcule } from "@/lib/cave";
import { cn } from "@/lib/utils";

const barColors: Record<StockCuveeCalcule["statut"], string> = {
  vert: "bg-vine",
  or: "bg-gold",
  rouge: "bg-destructive",
};

const REFERENCE_MOIS = 18; // écoulement au-delà duquel la barre est pleine

export function StockBars() {
  const stock = getStockCalcule(cuvees, mouvements);

  return (
    <Card className="border border-border/70 bg-card shadow-none">
      <CardHeader className="px-6">
        <CardTitle>Stock par cuvée</CardTitle>
        <CardDescription>Niveau de stock disponible en cave</CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <div className="flex flex-col gap-5">
          {stock.map((s) => {
            const enAlerte = s.statut === "rouge";
            const pourcentage =
              s.ecoulementMois === null
                ? 0
                : Math.min(100, (s.ecoulementMois / REFERENCE_MOIS) * 100);
            return (
              <div
                key={s.cuvee.id}
                className={cn(
                  enAlerte && "-mx-3 rounded-lg bg-destructive/5 px-3 py-2"
                )}
              >
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-ink">
                    {s.cuvee.nom}
                    {enAlerte && (
                      <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                        <TriangleAlert className="size-3.5" />
                        Alerte !
                      </span>
                    )}
                  </span>
                  <span className="text-stone">
                    {s.disponibleCommercial.toLocaleString("fr-FR")} bout. ·{" "}
                    {s.ecoulementMois === null ? "—" : `${s.ecoulementMois.toFixed(1)} mois de stock`}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all", barColors[s.statut])}
                    style={{ width: `${pourcentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="justify-end px-6">
        <Link
          href="/dashboard/cave"
          className="text-sm font-medium text-gold hover:underline"
        >
          Voir tout le stock →
        </Link>
      </CardFooter>
    </Card>
  );
}
