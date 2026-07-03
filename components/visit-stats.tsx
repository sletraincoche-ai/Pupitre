"use client";

import { Users, Globe2, ShoppingBag, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { visitesStats } from "@/lib/mock-data";
import { periodOptions, usePeriod } from "@/lib/period-context";

export function VisitStats() {
  const { period } = usePeriod();
  const periodLabel = periodOptions.find((o) => o.value === period)?.label;

  const stats = [
    {
      icon: Users,
      label: `Visiteurs (${periodLabel})`,
      value: visitesStats.totalVisiteurs.toString(),
    },
    {
      icon: Globe2,
      label: "Groupes étrangers",
      value: `${visitesStats.pourcentageEtrangers}%`,
    },
    {
      icon: ShoppingBag,
      label: "Achat post-visite",
      value: `${visitesStats.tauxAchatPostVisite}%`,
    },
    {
      icon: Star,
      label: "Note Google",
      value: `${visitesStats.noteGoogle.toLocaleString("fr-FR")} / 5`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="grid grid-cols-2 gap-4 xl:col-span-2 xl:grid-cols-4">
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

      <Card className="border-none bg-vine text-white shadow-none">
        <CardContent className="flex h-full flex-col justify-center px-6">
          <p className="text-sm text-white/70">Panier moyen post-visite</p>
          <p className="mt-2 font-heading text-4xl text-gold">
            {visitesStats.panierMoyen.toLocaleString("fr-FR")} €
          </p>
          <p className="mt-2 text-sm text-white/60">
            Les visiteurs qui achètent au caveau dépensent en moyenne ce
            montant, hors envoi export.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
