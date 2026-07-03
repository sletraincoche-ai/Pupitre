import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { stockCuvees } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function StockBars() {
  return (
    <Card className="border border-border/70 bg-card shadow-none">
      <CardHeader className="px-6">
        <CardTitle>Stock par cuvée</CardTitle>
        <CardDescription>Niveau de stock disponible en cave</CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <div className="flex flex-col gap-5">
          {stockCuvees.map((cuvee) => (
            <div key={cuvee.id}>
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className="font-medium text-ink">{cuvee.nom}</span>
                <span className="text-stone">
                  {cuvee.bouteilles.toLocaleString("fr-FR")} bout. · {cuvee.pourcentage}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    cuvee.pourcentage < 25 ? "bg-destructive" : "bg-gold"
                  )}
                  style={{ width: `${cuvee.pourcentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
