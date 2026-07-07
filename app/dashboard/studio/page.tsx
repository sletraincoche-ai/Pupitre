"use client";

import { BinderTabs } from "@/components/studio/dossier/binder-tabs";
import { StatsRow } from "@/components/studio/dossier/stats-row";
import { FicheTable } from "@/components/studio/dossier/fiche-table";
import { IdentiteHomeCard } from "@/components/studio/identite-home-card";
import { ImageBank } from "@/components/studio/image-bank";
import { NotificationCycle } from "@/components/studio/enrichissement/notification-cycle";
import { TunnelSequence } from "@/components/studio/tunnel/tunnel-sequence";
import { useOnboarding } from "@/lib/onboarding-context";
import { useIdentity } from "@/lib/identity-context";
import { photosDomaine, totalContenusStudioEnAttente } from "@/lib/mock-data";
import { getFiches, ficheEstCeMois } from "@/lib/fiches";

export default function StudioPage() {
  const { hydrated, tunnelTermine } = useOnboarding();
  const { hydrated: identiteHydratee, charte } = useIdentity();

  if (!hydrated) return null;

  if (!tunnelTermine) {
    return (
      <div className="flex flex-col gap-8">
        <TunnelSequence />
      </div>
    );
  }

  const fiches = getFiches();
  const fichesCeMois = fiches.filter(ficheEstCeMois);
  const publieesCeMois = fichesCeMois.filter((f) => f.statut !== "En attente");
  const dernieresFiches = [...fiches].reverse().slice(0, 12);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl text-ink lowercase">Studio</h1>
        <p className="mt-1 font-mono text-sm text-stone tabular-nums">
          {fichesCeMois.length} fiches ce mois, {totalContenusStudioEnAttente} en attente
        </p>
      </div>

      <StatsRow
        items={[
          { label: "À valider", value: String(totalContenusStudioEnAttente), accent: totalContenusStudioEnAttente > 0 },
          { label: "Publiées ce mois-ci", value: String(publieesCeMois.length) },
          {
            label: "Charte narrative",
            value: !identiteHydratee ? "—" : charte ? "Prête" : "À compléter",
          },
          { label: "Banque photo", value: `${photosDomaine.length} photos` },
        ]}
      />

      <NotificationCycle />

      <div>
        <BinderTabs />
        <div className="mt-4">
          <FicheTable fiches={dernieresFiches} />
        </div>
      </div>

      <div className="border-t border-border pt-8">
        <IdentiteHomeCard />
      </div>

      <div>
        <h2 className="mb-3 font-heading text-lg text-ink lowercase">Banque d&apos;images</h2>
        <ImageBank />
      </div>
    </div>
  );
}
