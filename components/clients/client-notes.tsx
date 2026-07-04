"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ClientNotes({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [brouillon, setBrouillon] = useState(value);

  return (
    <Card className="border border-border/70 bg-card shadow-none">
      <CardHeader className="px-6">
        <CardTitle>Notes libres</CardTitle>
        <CardDescription>Visibles uniquement par votre équipe</CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <textarea
          value={brouillon}
          onChange={(e) => setBrouillon(e.target.value)}
          rows={4}
          placeholder="Préférences, anecdotes, contexte utile au prochain contact…"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-ink outline-none placeholder:text-stone focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => {
            onChange(brouillon);
            toast.success("Note enregistrée");
          }}
        >
          Enregistrer la note
        </Button>
      </CardContent>
    </Card>
  );
}
