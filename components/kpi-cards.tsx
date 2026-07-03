"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, TriangleAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { kpis, visites, clientsActifsTotal, clientsDormantsTotal } from "@/lib/mock-data";
import { periodComparisonLabel, usePeriod } from "@/lib/period-context";
import { cn } from "@/lib/utils";

function KpiCardShell({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="block">
      <Card className="border border-border/70 bg-card shadow-none transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-md">
        <CardContent className="px-6">{children}</CardContent>
      </Card>
    </Link>
  );
}

function KpiLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-medium tracking-wider text-stone uppercase">
      {children}
    </p>
  );
}

function KpiTrend({ kpi }: { kpi: (typeof kpis)[number] }) {
  const { period } = usePeriod();
  const Icon = kpi.trend === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="mt-3 flex items-center gap-1.5 text-sm">
      <span
        className={cn(
          "flex items-center gap-0.5 font-medium",
          kpi.good ? "text-vine" : "text-destructive"
        )}
      >
        <Icon className="size-3.5" />
        {kpi.delta}
      </span>
      <span className="text-stone">{periodComparisonLabel[period]}</span>
    </div>
  );
}

export function KpiCards() {
  const [ca, bouteilles] = kpis;

  const visitesConfirmees = visites.filter((v) => v.statut === "Confirmée").length;
  const visitesEnAttente = visites.filter((v) => v.statut === "En attente").length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCardShell href="#ventes">
        <KpiLabel>{ca.label}</KpiLabel>
        <p className="mt-2 font-heading text-3xl text-ink">{ca.value}</p>
        <KpiTrend kpi={ca} />
      </KpiCardShell>

      <KpiCardShell href="/dashboard/stock">
        <KpiLabel>{bouteilles.label}</KpiLabel>
        <p className="mt-2 font-heading text-3xl text-ink">{bouteilles.value}</p>
        <KpiTrend kpi={bouteilles} />
      </KpiCardShell>

      <KpiCardShell href="/dashboard/visites">
        <KpiLabel>Visites planifiées</KpiLabel>
        <p className="mt-2 font-heading text-3xl text-ink">{visitesConfirmees}</p>
        <div className="mt-3 flex items-center gap-1.5 text-sm">
          <span className="font-medium text-gold">
            +{visitesEnAttente} demande{visitesEnAttente > 1 ? "s" : ""}
          </span>
          <span className="text-stone">en attente</span>
        </div>
      </KpiCardShell>

      <KpiCardShell href="/dashboard/clients">
        <KpiLabel>Clients actifs</KpiLabel>
        <p className="mt-2 font-heading text-3xl text-ink">
          {clientsActifsTotal.toLocaleString("fr-FR")}
        </p>
        <div className={cn("mt-3 flex items-center gap-1.5 text-sm")}>
          <span className="flex items-center gap-1 font-medium text-destructive">
            <TriangleAlert className="size-3.5" />
            {clientsDormantsTotal}
          </span>
          <span className="text-stone">dormants à réactiver</span>
        </div>
      </KpiCardShell>
    </div>
  );
}
