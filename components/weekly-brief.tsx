"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PartyPopper } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { briefHebdomadaire } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function WeeklyBrief() {
  const [items, setItems] = useState(briefHebdomadaire);
  const [leavingIds, setLeavingIds] = useState<Set<string>>(new Set());

  function traiter(id: string, action: string, titre: string) {
    toast.success(`Action lancée : ${action}`, { description: titre });
    setLeavingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 300);
  }

  return (
    <Card className="border border-border/70 bg-card shadow-none">
      <CardHeader className="px-6">
        <CardTitle>Brief de la semaine</CardTitle>
        <CardDescription>
          Généré chaque lundi à 7h · {items.length} action
          {items.length > 1 ? "s" : ""} prioritaire{items.length > 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        {items.length === 0 ? (
          <EmptyState
            icon={PartyPopper}
            title="Rien d'urgent cette semaine"
            description="Toutes les actions prioritaires ont été traitées. Le prochain brief arrive lundi à 7h."
          />
        ) : (
          <ol className="flex flex-col gap-5">
            {items.map((item, index) => (
              <li
                key={item.id}
                className={cn(
                  "flex gap-3 transition-all duration-300 ease-out",
                  leavingIds.has(item.id)
                    ? "translate-x-2 opacity-0"
                    : "opacity-100"
                )}
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-vine font-heading text-xs text-gold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ink">{item.titre}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-transparent",
                        item.priorite === "Élevé"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-gold/10 text-gold"
                      )}
                    >
                      {item.priorite}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-stone">{item.description}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2.5"
                    onClick={() => traiter(item.id, item.action, item.titre)}
                  >
                    {item.action}
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
