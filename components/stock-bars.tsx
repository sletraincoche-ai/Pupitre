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
import { stockCuvees } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function niveau(moisRestants: number): "vert" | "or" | "rouge" {
  if (moisRestants < 2) return "rouge";
  if (moisRestants < 6) return "or";
  return "vert";
}

const barColors: Record<ReturnType<typeof niveau>, string> = {
  vert: "bg-vine",
  or: "bg-gold",
  rouge: "bg-destructive",
};

export function StockBars() {
  return (
    <Card className="border border-border/70 bg-card shadow-none">
      <CardHeader className="px-6">
        <CardTitle>Stock par cuvée</CardTitle>
        <CardDescription>Niveau de stock disponible en cave</CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <div className="flex flex-col gap-5">
          {stockCuvees.map((cuvee) => {
            const etat = niveau(cuvee.moisRestants);
            const enAlerte = etat === "rouge";
            return (
              <div
                key={cuvee.id}
                className={cn(
                  enAlerte && "-mx-3 rounded-lg bg-destructive/5 px-3 py-2"
                )}
              >
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-ink">
                    {cuvee.nom}
                    {enAlerte && (
                      <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                        <TriangleAlert className="size-3.5" />
                        Alerte !
                      </span>
                    )}
                  </span>
                  <span className="text-stone">
                    {cuvee.bouteilles.toLocaleString("fr-FR")} bout. ·{" "}
                    {cuvee.moisRestants} mois de stock
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all", barColors[etat])}
                    style={{ width: `${cuvee.pourcentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="justify-end px-6">
        <Link
          href="/dashboard/stock"
          className="text-sm font-medium text-gold hover:underline"
        >
          Voir tout le stock →
        </Link>
      </CardFooter>
    </Card>
  );
}
