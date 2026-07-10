import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/glass/glass-panel";
import { GlassSheen } from "@/components/glass/glass-sheen";
import { MetaConnectionCard } from "@/components/parametres/meta-connection-card";
import { LinkedinStubCard } from "@/components/parametres/linkedin-stub-card";
import { GmailStubCard } from "@/components/parametres/gmail-stub-card";

export function ConnexionScreen({ onContinuer }: { onContinuer: () => void }) {
  return (
    <GlassPanel intensity="strong" className="relative mx-auto max-w-2xl overflow-hidden">
      <GlassSheen />
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 py-10">
        <div className="text-center">
          <p className="font-heading text-2xl text-white">Connectez vos comptes</p>
          <p className="mt-2 text-sm text-white/70">
            Facultatif ici, mais nécessaire pour publier directement depuis le Studio. Vous pourrez
            toujours le faire plus tard depuis les Paramètres.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <MetaConnectionCard />
          </div>
          <GmailStubCard />
          <LinkedinStubCard />
        </div>

        <Button className="bg-gold text-white hover:bg-gold/90" onClick={onContinuer}>
          Continuer
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </GlassPanel>
  );
}
