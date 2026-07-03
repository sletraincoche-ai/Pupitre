"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ventesMensuelles } from "@/lib/mock-data";
import { periodOptions, usePeriod } from "@/lib/period-context";

type ChartTooltipProps = {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
};

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-ink">{label}</p>
      <p className="text-stone">{payload[0].value} k€</p>
    </div>
  );
}

export function SalesChart() {
  const { period } = usePeriod();
  const periodLabel = periodOptions.find((o) => o.value === period)?.label;

  return (
    <Card className="border border-border/70 bg-card shadow-none">
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
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ventesMensuelles} barCategoryGap="24%">
              <XAxis
                dataKey="mois"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B6459", fontSize: 11 }}
              />
              <Tooltip cursor={{ fill: "#2E4B3C", opacity: 0.06 }} content={<ChartTooltip />} />
              <Bar dataKey="valeur" fill="#B8933E" radius={[3, 3, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
