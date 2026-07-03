"use client";

import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { ventesMensuelles, campagnesMarketing } from "@/lib/mock-data";
import { periodOptions, usePeriod } from "@/lib/period-context";

const moisComplets: Record<string, string> = {
  Août: "Août",
  Sept: "Septembre",
  Oct: "Octobre",
  Nov: "Novembre",
  Déc: "Décembre",
  Jan: "Janvier",
  Fév: "Février",
  Mars: "Mars",
  Avr: "Avril",
  Mai: "Mai",
  Juin: "Juin",
  Juil: "Juillet",
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
};

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-ink">{moisComplets[label] ?? label}</p>
      <p className="text-stone">{payload[0].value} k€</p>
    </div>
  );
}

export function SalesChart() {
  const { period } = usePeriod();
  const periodLabel = periodOptions.find((o) => o.value === period)?.label;
  const moisCourant = ventesMensuelles[ventesMensuelles.length - 1]?.mois;

  return (
    <Card id="ventes" className="scroll-mt-6 border border-border/70 bg-card shadow-none">
      <CardHeader className="px-6">
        <CardTitle>Ventes des 12 derniers mois</CardTitle>
        <CardDescription>Chiffre d&apos;affaires mensuel, en k€</CardDescription>
        <CardAction>
          <Badge variant="outline" className="border-gold/40 text-gold">
            {periodLabel}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="px-6">
        {ventesMensuelles.length < 3 ? (
          <EmptyState
            icon={BarChart3}
            title="Pas encore assez de données"
            description="Le graphique des ventes s'affichera dès que Pupitre aura au moins 3 mois d'historique. Continuez à enregistrer vos commandes."
          />
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ventesMensuelles}
                barCategoryGap="24%"
                margin={{ top: 18, right: 8, left: 8, bottom: 0 }}
              >
                <XAxis
                  dataKey="mois"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B6459", fontSize: 11 }}
                />
                <Tooltip cursor={{ fill: "#2E4B3C", opacity: 0.06 }} content={<ChartTooltip />} />
                {campagnesMarketing.map((campagne) => (
                  <ReferenceLine
                    key={campagne.mois}
                    x={campagne.mois}
                    stroke="#2E4B3C"
                    strokeDasharray="3 3"
                    strokeOpacity={0.4}
                    label={{
                      value: campagne.nom,
                      position: "top",
                      fill: "#6B6459",
                      fontSize: 10,
                    }}
                  />
                ))}
                <Bar dataKey="valeur" radius={[3, 3, 0, 0]} maxBarSize={36}>
                  {ventesMensuelles.map((entry) => (
                    <Cell
                      key={entry.mois}
                      fill={entry.mois === moisCourant ? "#B8933E" : "#2E4B3C26"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
