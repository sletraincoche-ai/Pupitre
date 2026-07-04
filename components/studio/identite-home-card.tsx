"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIdentity } from "@/lib/identity-context";

export function IdentiteHomeCard() {
  const { hydrated, charte } = useIdentity();
  const [masque, setMasque] = useState(false);

  if (!hydrated) return null;

  if (charte) {
    return (
      <Card className="border border-border/70 bg-card shadow-none">
        <CardContent className="flex items-center gap-3 px-6">
          <span className="flex size-9 items-center justify-center rounded-full bg-gold/10 text-gold">
            <Sparkles className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-ink">Charte narrative prête</p>
            <p className="truncate text-sm text-stone">Ton : {charte.ton}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/dashboard/studio/identite">Consulter</Link>}
            nativeButton={false}
          />
        </CardContent>
      </Card>
    );
  }

  if (masque) {
    return (
      <Link
        href="/dashboard/studio/identite"
        className="flex items-center gap-2 text-sm text-stone hover:text-vine"
      >
        <Sparkles className="size-4 text-gold" />
        Test d&apos;identité — pas encore complété
        <ArrowRight className="size-3.5" />
      </Link>
    );
  }

  return (
    <Card className="border border-border/70 bg-card shadow-none">
      <CardContent className="flex flex-col items-start gap-3 px-6 sm:flex-row sm:items-center">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
          <Sparkles className="size-4" />
        </span>
        <div className="flex-1">
          <p className="font-medium text-ink">Testez votre identité éditoriale</p>
          <p className="mt-0.5 text-sm text-stone">
            12 questions, 15 à 20 minutes — donnez au Studio la voix de votre domaine.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            size="sm"
            className="bg-gold text-white hover:bg-gold/90"
            render={<Link href="/dashboard/studio/identite">Commencer le test</Link>}
            nativeButton={false}
          />
          <Button size="sm" variant="ghost" onClick={() => setMasque(true)}>
            Plus tard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
