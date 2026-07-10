"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/glass/glass-panel";
import { GlassSheen } from "@/components/glass/glass-sheen";
import { ConsentScreen } from "@/components/studio/identite/consent-screen";
import { IdentityQuiz } from "@/components/studio/identite/quiz";
import { CharteProposal } from "@/components/studio/identite/charte-proposal";
import { CharteSummary } from "@/components/studio/identite/charte-summary";
import { GlassPageShell } from "@/components/glass/glass-page-shell";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { useIdentity } from "@/lib/identity-context";

function InvitationScreen({ onCommencer }: { onCommencer: () => void }) {
  return (
    <GlassPanel intensity="strong" className="relative mx-auto w-full max-w-xl overflow-hidden">
      <GlassSheen />
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 py-10 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-gold/15 text-gold">
          <FileText className="size-5" />
        </span>
        <p className="font-heading text-xl text-white">Testez votre identité éditoriale</p>
        <p className="max-w-md text-sm leading-relaxed text-white/70">
          Ce test aide votre copilote IA à écrire comme vous, pas comme un robot. En répondant à
          12 questions sur votre histoire et vos cuvées, vous donnez au Studio la voix de votre
          domaine, sur laquelle chaque post et chaque email s&apos;appuiera. Comptez 15 à 20
          minutes. Ce n&apos;est pas obligatoire, mais fortement recommandé.
        </p>
        <div className="mt-2 flex gap-2">
          <Button className="bg-gold text-white hover:bg-gold/90" onClick={onCommencer}>
            Commencer le test
          </Button>
          <Button
            variant="ghost"
            className="text-white/80 hover:bg-white/10 hover:text-white"
            render={<Link href="/dashboard/studio">Plus tard</Link>}
            nativeButton={false}
          />
        </div>
      </div>
    </GlassPanel>
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

  // La charte (consultation et proposition à valider) passe elle aussi au
  // Liquid Glass : même coquille plein écran (fond, verre, nav) que le
  // reste du Studio déjà converti, pour ne pas retomber sur le thème clair
  // juste après le test qui, lui, est déjà en verre.
  if (hydrated && (affichageCharte || enProposition)) {
    return (
      <GlassPageShell>
        <GlassPageHeader
          title="Charte narrative"
          subtitle="La charte narrative qui rend chaque génération crédible sous votre nom."
        />
        {affichageCharte ? (
          <CharteSummary onModifier={() => setModeEdition(true)} />
        ) : (
          <CharteProposal
            onValide={() => setModeEdition(false)}
            onRefaire={() => setModeEdition(true)}
            onAnnuler={() => setModeEdition(false)}
          />
        )}
      </GlassPageShell>
    );
  }

  return (
    <GlassPageShell>
      <GlassPageHeader
        title="Test d'identité"
        subtitle="La charte narrative qui rend chaque génération crédible sous votre nom."
      />
      <div className="flex flex-1 items-center justify-center py-6">
        {!hydrated ? null : montrerConsentement ? (
          <ConsentScreen onAccepter={accepterConsentement} />
        ) : (
          <InvitationScreen onCommencer={() => setMontrerConsentement(true)} />
        )}
      </div>
    </GlassPageShell>
  );
}
