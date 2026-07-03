"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { kpis } from "@/lib/mock-data";
import { periodComparisonLabel, usePeriod } from "@/lib/period-context";
import { cn } from "@/lib/utils";

export function KpiCards() {
  const { period } = usePeriod();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.id} className="border border-border/70 bg-card shadow-none">
          <CardContent className="px-6">
            <p className="text-sm text-stone">{kpi.label}</p>
            <p className="mt-2 font-heading text-3xl text-ink">{kpi.value}</p>
            <div className="mt-3 flex items-center gap-1.5 text-sm">
              <span
                className={cn(
                  "flex items-center gap-0.5 font-medium",
                  kpi.good ? "text-vine" : "text-destructive"
                )}
              >
                {kpi.trend === "up" ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <ArrowDownRight className="size-3.5" />
                )}
                {kpi.delta}
              </span>
              <span className="text-stone">{periodComparisonLabel[period]}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
