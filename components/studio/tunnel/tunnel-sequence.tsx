"use client";

import { ExplicationScreen } from "@/components/studio/tunnel/explication-screen";
import { ConnexionScreen } from "@/components/studio/tunnel/connexion-screen";
import { InvitationScreen } from "@/components/studio/tunnel/invitation-screen";
import { useOnboarding } from "@/lib/onboarding-context";

export function TunnelSequence({ onTermine }: { onTermine: () => void }) {
  const { etapeTunnel, setEtapeTunnel, terminerTunnel } = useOnboarding();

  function terminer() {
    // terminerTunnel() persiste tunnel_termine=true (déjà vrai en base
    // dès le premier accès, voir /api/studio/onboarding) — onTermine()
    // fait basculer CETTE session du tunnel vers le tableau de bord,
    // indépendamment de ce flag persisté qui ne change plus une fois le
    // rang créé.
    terminerTunnel();
    onTermine();
  }

  if (etapeTunnel === 0) {
    return <ExplicationScreen onCommencer={() => setEtapeTunnel(1)} />;
  }

  if (etapeTunnel === 1) {
    return <ConnexionScreen onContinuer={() => setEtapeTunnel(2)} />;
  }

  return <InvitationScreen onPlusTard={terminer} onFaireLeTest={terminer} />;
}
