"use client";

import { ExplicationScreen } from "@/components/studio/tunnel/explication-screen";
import { ConnexionScreen } from "@/components/studio/tunnel/connexion-screen";
import { InvitationScreen } from "@/components/studio/tunnel/invitation-screen";
import { useOnboarding } from "@/lib/onboarding-context";

export function TunnelSequence() {
  const { etapeTunnel, setEtapeTunnel, terminerTunnel } = useOnboarding();

  if (etapeTunnel === 0) {
    return <ExplicationScreen onCommencer={() => setEtapeTunnel(1)} />;
  }

  if (etapeTunnel === 1) {
    return <ConnexionScreen onContinuer={() => setEtapeTunnel(2)} />;
  }

  return <InvitationScreen onPlusTard={terminerTunnel} onFaireLeTest={terminerTunnel} />;
}
