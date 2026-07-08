"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConsentScreen } from "@/components/studio/identite/consent-screen";
import { IdentityQuiz } from "@/components/studio/identite/quiz";
import { CharteProposal } from "@/components/studio/identite/charte-proposal";
import { CharteSummary } from "@/components/studio/identite/charte-summary";
import { useIdentity } from "@/lib/identity-context";

function InvitationScreen({ onCommencer }: { onCommencer: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 border border-border bg-card px-6 py-10 text-center">
      <span className="flex size-11 items-center justify-center rounded-[3px] border border-gold/30 text-gold">
        <FileText className="size-5" />
      </span>
      <p className="font-heading text-xl text-ink">Testez votre identité éditoriale</p>
      <p className="max-w-md text-sm leading-relaxed text-stone">
        Ce test aide votre copilote IA à écrire comme vous, pas comme un robot. En répondant à
        12 questions sur votre histoire et vos cuvées, vous donnez au Studio la voix de votre
        domaine — chaque post, chaque email s&apos;appuiera dessus. Comptez 15 à 20 minutes. Ce
        n&apos;est pas obligatoire, mais fortement recommandé.
      </p>
      <div className="mt-2 flex gap-2">
        <Button className="rounded-[3px] bg-gold text-white hover:bg-gold/90" onClick={onCommencer}>
          Commencer le test
        </Button>
        <Button
          variant="ghost"
          className="rounded-[3px]"
          render={<Link href="/dashboard/studio">Plus tard</Link>}
          nativeButton={false}
        />
      </div>
    </div>
  );
}

export default function IdentitePage() {
  const {
    hydrated,
    consentement,
    charte,
    charteProposee,
    enGeneration,
    erreurGeneration,
    accepterConsentement,
    genererCharte,
  } = useIdentity();
  const [montrerConsentement, setMontrerConsentement] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);

  const enProposition = !!charteProposee || enGeneration || !!erreurGeneration;
  const affichageCharte = !!charte && !modeEdition && !enProposition;
  // Le quiz est plein écran avec son propre logo/fil d'Ariane : le
  // bandeau de titre de cette page ne doit jamais se répéter derrière.
  const enQuiz = hydrated && consentement && !affichageCharte && !enProposition;

  if (enQuiz) {
    return <IdentityQuiz onTermine={() => genererCharte()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard/studio" className="flex w-fit items-center gap-1.5 text-sm text-stone hover:text-vine">
        <ArrowLeft className="size-4" />
        Retour au Studio
      </Link>

      <div>
        <h1 className="font-heading text-3xl text-ink lowercase">Test d&apos;identité</h1>
        <p className="mt-1 text-stone">La charte narrative qui rend chaque génération crédible sous votre nom.</p>
      </div>

      {!hydrated ? null : affichageCharte ? (
        <CharteSummary onModifier={() => setModeEdition(true)} />
      ) : enProposition ? (
        <CharteProposal
          onValide={() => setModeEdition(false)}
          onRefaire={() => setModeEdition(true)}
          onAnnuler={() => setModeEdition(false)}
        />
      ) : montrerConsentement ? (
        <ConsentScreen onAccepter={accepterConsentement} />
      ) : (
        <InvitationScreen onCommencer={() => setMontrerConsentement(true)} />
      )}
    </div>
  );
}
