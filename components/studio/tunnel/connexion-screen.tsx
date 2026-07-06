import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetaConnectionCard } from "@/components/parametres/meta-connection-card";
import { LinkedinStubCard } from "@/components/parametres/linkedin-stub-card";
import { GmailStubCard } from "@/components/parametres/gmail-stub-card";

export function ConnexionScreen({ onContinuer }: { onContinuer: () => void }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
      <div className="text-center">
        <p className="font-heading text-2xl text-ink">Connectez vos comptes</p>
        <p className="mt-2 text-sm text-stone">
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
  );
}
