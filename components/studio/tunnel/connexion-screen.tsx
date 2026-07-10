import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/glass/glass-panel";
import { GlassSheen } from "@/components/glass/glass-sheen";
import { ConnexionsPanel } from "@/components/studio/connexions/connexions-panel";

export function ConnexionScreen({ onContinuer }: { onContinuer: () => void }) {
  return (
    <GlassPanel intensity="strong" className="relative mx-auto max-w-2xl overflow-hidden">
      <GlassSheen />
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 py-10">
        <div className="text-center">
          <p className="font-heading text-2xl text-white">Connectez vos comptes</p>
          <p className="mt-2 text-sm text-white/70">
            Facultatif ici, mais indispensable pour publier depuis le Studio : sans connexion,
            aucune publication ni aucun envoi n&apos;est possible. Vous pourrez toujours le faire
            plus tard, directement depuis Studio IA.
          </p>
        </div>

        <ConnexionsPanel />

        <Button className="bg-gold text-white hover:bg-gold/90" onClick={onContinuer}>
          Continuer
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </GlassPanel>
  );
}
