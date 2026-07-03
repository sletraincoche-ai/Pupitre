import { Settings } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function ParametresPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl text-ink">Paramètres</h1>
        <p className="mt-1 text-stone">
          Profil du domaine, charte narrative et configuration des automatisations.
        </p>
      </div>
      <EmptyState
        icon={Settings}
        title="Les paramètres arrivent bientôt"
        description="Profil du domaine, charte narrative, types de visites, connexions et gestion des utilisateurs seront réunis ici prochainement."
        actionLabel="Retour au tableau de bord"
        actionHref="/dashboard"
      />
    </div>
  );
}
