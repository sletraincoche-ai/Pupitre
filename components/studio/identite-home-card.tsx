"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIdentity } from "@/lib/identity-context";

export function IdentiteHomeCard() {
  const { hydrated, charte } = useIdentity();
  const [masque, setMasque] = useState(false);

  if (!hydrated) return null;

  if (charte) {
    return (
      <div className="border border-border bg-card">
        <div className="flex items-center gap-3 px-6 py-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[3px] border border-gold/30 text-gold">
            <FileText className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-ink">Charte narrative prête</p>
            <p className="truncate text-sm text-stone">Ton : {charte.ton}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-[3px]"
            render={<Link href="/dashboard/studio/identite">Consulter</Link>}
            nativeButton={false}
          />
        </div>
      </div>
    );
  }

  if (masque) {
    return (
      <Link
        href="/dashboard/studio/identite"
        className="flex items-center gap-2 text-sm text-stone hover:text-vine"
      >
        <FileText className="size-4 text-gold" />
        Test d&apos;identité — pas encore complété
        <ArrowRight className="size-3.5" />
      </Link>
    );
  }

  return (
    <div className="border border-border bg-card">
      <div className="flex flex-col items-start gap-3 px-6 py-4 sm:flex-row sm:items-center">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[3px] border border-gold/30 text-gold">
          <FileText className="size-4" />
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
            className="rounded-[3px] bg-gold text-white hover:bg-gold/90"
            render={<Link href="/dashboard/studio/identite">Commencer le test</Link>}
            nativeButton={false}
          />
          <Button size="sm" variant="ghost" className="rounded-[3px]" onClick={() => setMasque(true)}>
            Plus tard
          </Button>
        </div>
      </div>
    </div>
  );
}
