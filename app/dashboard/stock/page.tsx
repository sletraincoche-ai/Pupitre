import { PackageSearch } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function StockPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl text-ink">Stock</h1>
        <p className="mt-1 text-stone">
          Vision commerciale de votre stock, cuvée par cuvée.
        </p>
      </div>
      <EmptyState
        icon={PackageSearch}
        title="L'onglet Stock arrive bientôt"
        description="Le tableau détaillé des cuvées, la vitesse d'écoulement et les alertes de rupture sont en cours de construction. En attendant, l'aperçu du stock reste visible sur le tableau de bord."
        actionLabel="Retour au tableau de bord"
        actionHref="/dashboard"
      />
    </div>
  );
}
