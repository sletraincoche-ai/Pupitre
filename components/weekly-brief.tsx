"use client";

import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { briefHebdomadaire } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function WeeklyBrief() {
  return (
    <Card className="border border-border/70 bg-card shadow-none">
      <CardHeader className="px-6">
        <CardTitle>Brief hebdomadaire</CardTitle>
        <CardDescription>3 actions prioritaires cette semaine</CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <ol className="flex flex-col gap-5">
          {briefHebdomadaire.map((item, index) => (
            <li key={item.id} className="flex gap-3">
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
                      item.priorite === "Haute"
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
                  onClick={() =>
                    toast.success(`Action lancée : ${item.action}`, {
                      description: item.titre,
                    })
                  }
                >
                  {item.action}
                </Button>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
