import { Euro, GlassWater, Wine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ClientStats({
  totalDepense,
  nombreVisites,
  bouteillesAchetees,
}: {
  totalDepense: number;
  nombreVisites: number;
  bouteillesAchetees: number;
}) {
  const stats = [
    { icon: Euro, label: "Total dépensé", value: `${totalDepense.toLocaleString("fr-FR")} €` },
    { icon: GlassWater, label: "Visites", value: String(nombreVisites) },
    { icon: Wine, label: "Bouteilles achetées", value: String(bouteillesAchetees) },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border border-border/70 bg-card shadow-none">
            <CardContent className="px-5">
              <span className="flex size-9 items-center justify-center rounded-full bg-vine/10 text-vine">
                <Icon className="size-4" />
              </span>
              <p className="mt-3 font-heading text-2xl text-ink">{stat.value}</p>
              <p className="mt-1 text-xs text-stone">{stat.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
