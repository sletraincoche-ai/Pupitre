import { MetaConnexionGlass } from "@/components/studio/connexions/meta-connexion-glass";
import { GmailConnexionGlass } from "@/components/studio/connexions/gmail-connexion-glass";
import { LinkedinConnexionGlass } from "@/components/studio/connexions/linkedin-connexion-glass";

// Bloc des 3 connexions (Instagram & Facebook, Gmail, LinkedIn), partagé
// par le tunnel d'accueil et le panneau "Connexions" ouvrable depuis
// n'importe quelle action de Studio IA qui l'exige.
export function ConnexionsPanel() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <MetaConnexionGlass />
      </div>
      <GmailConnexionGlass />
      <LinkedinConnexionGlass />
    </div>
  );
}
