"use client";

import {
  ShieldAlert,
  Sprout,
  Check,
  GlassWater,
  Camera,
  Mail,
  Star,
  X,
  CalendarHeart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  AgendaEvent,
  EvenementCave,
  EvenementPersonnel,
  EvenementPublication,
  EvenementReglementaire,
  EvenementVisite,
} from "@/lib/agenda";
import { categorieColors } from "@/lib/agenda";
import type { ContenuStudio } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const plateformeIcons: Record<ContenuStudio["plateforme"], typeof Camera> = {
  Instagram: Camera,
  Email: Mail,
  "Avis Google": Star,
};

const visiteStatutStyles: Record<string, string> = {
  Confirmée: "bg-vine/10 text-vine",
  "En attente": "bg-gold/15 text-gold",
  Annulée: "bg-destructive/10 text-destructive",
};

function CardShell({
  categorie,
  children,
}: {
  categorie: AgendaEvent["categorie"];
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg border border-border/70 bg-card py-3 pr-4 pl-4"
      style={{ borderLeft: `3px solid ${categorieColors[categorie]}` }}
    >
      {children}
    </div>
  );
}

function ReglementaireCard({ event }: { event: EvenementReglementaire }) {
  return (
    <CardShell categorie="reglementaire">
      <div className="flex items-start gap-2.5">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-ink">{event.titre}</p>
          <p className="mt-0.5 text-sm text-stone">{event.description}</p>
          <p className="mt-1.5 text-xs text-stone/70">
            Géré automatiquement — non modifiable ici
          </p>
        </div>
      </div>
    </CardShell>
  );
}

function CaveCard({
  event,
  valide,
  onValider,
}: {
  event: EvenementCave;
  valide: boolean;
  onValider: () => void;
}) {
  return (
    <CardShell categorie="cave">
      <div className="flex items-start gap-2.5">
        <Sprout className="mt-0.5 size-4 shrink-0 text-vine" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-ink">{event.titre}</p>
          <p className="mt-0.5 text-sm text-stone">{event.description}</p>
          <div className="mt-2">
            {valide ? (
              <Badge variant="outline" className="border-transparent bg-vine/10 text-vine">
                <Check className="size-3" />
                Validé
              </Badge>
            ) : (
              <Button size="sm" className="bg-vine text-white hover:bg-vine/90" onClick={onValider}>
                Valider
              </Button>
            )}
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function VisiteCard({ event }: { event: EvenementVisite }) {
  const v = event.visite;
  return (
    <CardShell categorie="visites">
      <div className="flex items-start gap-2.5">
        <GlassWater className="mt-0.5 size-4 shrink-0 text-gold" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-ink">{v.client}</p>
            <Badge variant="outline" className={cn("border-transparent", visiteStatutStyles[v.statut])}>
              {v.statut}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-stone">
            {v.heure} · {v.formule} · {v.langue} · {v.personnes} pers.
          </p>
        </div>
      </div>
    </CardShell>
  );
}

function PublicationCard({ event }: { event: EvenementPublication }) {
  const Icon = plateformeIcons[event.plateforme];
  return (
    <CardShell categorie="publications">
      <div className="flex items-start gap-2.5">
        <Icon className="mt-0.5 size-4 shrink-0 text-stone" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-ink">{event.titre}</p>
            <span className="text-xs text-stone">{event.plateforme}</span>
          </div>
          <p className="mt-1 text-xs text-stone/70">
            Validé depuis le Studio IA — lecture seule ici
          </p>
        </div>
      </div>
    </CardShell>
  );
}

function PersonnelCard({
  event,
  onSupprimer,
}: {
  event: EvenementPersonnel;
  onSupprimer: () => void;
}) {
  return (
    <CardShell categorie="personnel">
      <div className="flex items-start gap-2.5">
        <CalendarHeart className="mt-0.5 size-4 shrink-0" style={{ color: categorieColors.personnel }} />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-ink">{event.titre}</p>
          {event.note && <p className="mt-0.5 text-sm text-stone">{event.note}</p>}
        </div>
        <button
          onClick={onSupprimer}
          aria-label="Supprimer"
          className="flex size-6 shrink-0 items-center justify-center rounded-md text-stone hover:bg-muted hover:text-destructive"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </CardShell>
  );
}

export function DayEventsList({
  events,
  caveValidees,
  onValiderCave,
  onSupprimerPersonnel,
}: {
  events: AgendaEvent[];
  caveValidees: Set<string>;
  onValiderCave: (id: string) => void;
  onSupprimerPersonnel: (id: string) => void;
}) {
  if (events.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/70 py-8 text-center text-sm text-stone">
        Aucun événement ce jour-là.
      </p>
    );
  }

  const tries = [...events].sort((a, b) => (a.heure ?? "").localeCompare(b.heure ?? ""));

  return (
    <div className="flex flex-col gap-3">
      {tries.map((event) => {
        switch (event.categorie) {
          case "reglementaire":
            return <ReglementaireCard key={event.id} event={event} />;
          case "cave":
            return (
              <CaveCard
                key={event.id}
                event={event}
                valide={caveValidees.has(event.id)}
                onValider={() => onValiderCave(event.id)}
              />
            );
          case "visites":
            return <VisiteCard key={event.id} event={event} />;
          case "publications":
            return <PublicationCard key={event.id} event={event} />;
          case "personnel":
            return (
              <PersonnelCard
                key={event.id}
                event={event}
                onSupprimer={() => onSupprimerPersonnel(event.id)}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
