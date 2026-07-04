"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileText, CalendarClock, Check } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DrmDocument } from "@/components/cave/drm-document";
import { AUJOURDHUI, drmHistorique, type Cuvee, type Mouvement } from "@/lib/mock-data";
import { getJoursAvantEcheance, getMouvementsDuMois, moisADeclarer, moisLabel } from "@/lib/cave";

const aujourdhuiLabel = AUJOURDHUI.toLocaleDateString("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function DrmBanner({
  cuvees,
  mouvements,
}: {
  cuvees: Cuvee[];
  mouvements: Mouvement[];
}) {
  const [open, setOpen] = useState(false);
  const [preparee, setPreparee] = useState(false);
  const [historique, setHistorique] = useState(drmHistorique);

  const moisCle = moisADeclarer();
  const label = moisLabel(moisCle);
  const nombreMouvements = getMouvementsDuMois(mouvements, moisCle).length;
  const jours = getJoursAvantEcheance();

  function marquerPreparee() {
    setHistorique((prev) => [{ mois: label, preparéeLe: aujourdhuiLabel }, ...prev]);
    setPreparee(true);
    toast.success(`DRM de ${label} marquée comme préparée`, {
      description: "N'oubliez pas de la recopier sur CIEL.",
    });
    setOpen(false);
  }

  return (
    <>
      <Card className="border border-border/70 bg-card shadow-none">
        <CardContent className="flex flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-vine/10 text-vine">
              <FileText className="size-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-heading text-lg text-ink">
                  Préparation DRM — {label}
                </p>
                {preparee && (
                  <Badge variant="outline" className="border-transparent bg-vine/10 text-vine">
                    <Check className="size-3" />
                    Préparée
                  </Badge>
                )}
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-stone">
                {nombreMouvements} mouvements capturés
                <span className="text-border">·</span>
                <CalendarClock className="size-3.5" />
                {jours > 0
                  ? `${jours} jour${jours > 1 ? "s" : ""} avant le 10`
                  : "Échéance du 10 dépassée"}
              </p>
            </div>
          </div>
          <Button
            className="h-11 shrink-0 bg-gold text-white hover:bg-gold/90"
            onClick={() => setOpen(true)}
          >
            Préparer ma DRM
          </Button>
        </CardContent>

        {historique.length > 0 && (
          <CardFooter className="flex flex-wrap gap-x-6 gap-y-1 px-6 text-xs text-stone">
            {historique.slice(0, 3).map((h) => (
              <span key={h.mois}>
                {h.mois} — préparée le {h.preparéeLe}
              </span>
            ))}
          </CardFooter>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Récapitulatif DRM — ${label}`}
        maxWidthClassName="max-w-xl"
      >
        <DrmDocument moisCle={moisCle} cuvees={cuvees} mouvements={mouvements} />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Fermer
          </Button>
          <Button
            className="bg-vine text-white hover:bg-vine/90"
            onClick={marquerPreparee}
          >
            Marquer comme préparée
          </Button>
        </div>
      </Modal>
    </>
  );
}
