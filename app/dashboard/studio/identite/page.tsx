"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConsentScreen } from "@/components/studio/identite/consent-screen";
import { IdentityQuiz } from "@/components/studio/identite/quiz";
import { CharteSummary } from "@/components/studio/identite/charte-summary";
import { useIdentity } from "@/lib/identity-context";

function InvitationScreen({ onCommencer }: { onCommencer: () => void }) {
  return (
    <Card className="mx-auto max-w-xl border border-border/70 bg-card shadow-none">
      <CardContent className="flex flex-col items-center gap-4 px-6 py-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-gold/10 text-gold">
          <Sparkles className="size-6" />
        </span>
        <p className="font-heading text-xl text-ink">Testez votre identité éditoriale</p>
        <p className="max-w-md text-sm leading-relaxed text-stone">
          Ce test aide votre copilote IA à écrire comme vous, pas comme un robot. En répondant à
          12 questions sur votre histoire et vos cuvées, vous donnez au Studio la voix de votre
          domaine — chaque post, chaque email s&apos;appuiera dessus. Comptez 15 à 20 minutes. Ce
          n&apos;est pas obligatoire, mais fortement recommandé.
        </p>
        <div className="mt-2 flex gap-2">
          <Button className="bg-gold text-white hover:bg-gold/90" onClick={onCommencer}>
            Commencer le test
          </Button>
          <Button variant="ghost" render={<Link href="/dashboard/studio">Plus tard</Link>} nativeButton={false} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function IdentitePage() {
  const { hydrated, consentement, charte, accepterConsentement, recommencerEdition } = useIdentity();
  const [montrerConsentement, setMontrerConsentement] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard/studio" className="flex w-fit items-center gap-1.5 text-sm text-stone hover:text-vine">
        <ArrowLeft className="size-4" />
        Retour au Studio
      </Link>

      <div>
        <h1 className="font-heading text-3xl text-ink">Test d&apos;identité</h1>
        <p className="mt-1 text-stone">La charte narrative qui rend chaque génération crédible sous votre nom.</p>
      </div>

      {!hydrated ? null : charte && !modeEdition ? (
        <CharteSummary
          onModifier={() => {
            recommencerEdition();
            setModeEdition(true);
          }}
        />
      ) : consentement ? (
        <IdentityQuiz onTermine={() => setModeEdition(false)} />
      ) : montrerConsentement ? (
        <ConsentScreen onAccepter={accepterConsentement} />
      ) : (
        <InvitationScreen onCommencer={() => setMontrerConsentement(true)} />
      )}
    </div>
  );
}
