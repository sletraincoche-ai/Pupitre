import { CalendarHeart, GlassWater, Languages, Receipt, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import type { Mouvement, Visite } from "@/lib/mock-data";
import { formatHistorique } from "@/lib/visites";

const statutStyles: Record<Visite["statut"], string> = {
  Confirmée: "bg-white/15 text-white",
  "En attente": "bg-gold/90 text-white",
  Annulée: "bg-destructive/80 text-white",
};

export function HeroCard({
  visite,
  mouvements,
  toutesLesVisites,
  onOuvrirVente,
  onOuvrirConfirmation,
}: {
  visite: Visite | null;
  mouvements: Mouvement[];
  toutesLesVisites: Visite[];
  onOuvrirVente: () => void;
  onOuvrirConfirmation: () => void;
}) {
  if (!visite) {
    return (
      <EmptyState
        icon={CalendarHeart}
        title="Aucune visite prévue"
        description="Dès qu'une réservation arrive, elle apparaît ici en priorité — heure, groupe et historique en un coup d'œil."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-vine text-white shadow-lg">
      <div className="flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium tracking-wider text-gold uppercase">
              Prochaine visite
            </p>
            <Badge variant="outline" className={`border-transparent ${statutStyles[visite.statut]}`}>
              {visite.statut}
            </Badge>
          </div>
          <h2 className="mt-2 font-heading text-3xl">
            {visite.heure} — {visite.client}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-white/80">
            <span className="flex items-center gap-1.5">
              <Users className="size-4" />
              {visite.personnes} personne{visite.personnes > 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <Languages className="size-4" />
              {visite.langue}
            </span>
            <span className="flex items-center gap-1.5">
              <GlassWater className="size-4" />
              {visite.formule}
            </span>
          </div>
          <p className="mt-3 text-sm text-gold">
            {formatHistorique(visite, mouvements, toutesLesVisites)}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <Button className="h-11 bg-gold text-white hover:bg-gold/90" onClick={onOuvrirVente}>
            <Receipt className="size-4" />
            Enregistrer une vente
          </Button>
          {visite.statut === "Confirmée" && (
            <Button
              variant="ghost"
              className="text-white/70 hover:bg-white/10 hover:text-white"
              onClick={onOuvrirConfirmation}
            >
              Voir la confirmation envoyée
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
