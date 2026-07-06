"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sprout, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEtapesCycleProches } from "@/lib/agenda";
import { useIdentity } from "@/lib/identity-context";

const STORAGE_KEY = "pupitre.notifications-cycle-traitees.v1";

function lireTraitees(): string[] {
  try {
    const brut = window.localStorage.getItem(STORAGE_KEY);
    return brut ? JSON.parse(brut) : [];
  } catch {
    return [];
  }
}

export function NotificationCycle() {
  const { ajouterEnrichissement } = useIdentity();
  const [traitees, setTraitees] = useState<string[] | null>(null);
  const [reponseOuverte, setReponseOuverte] = useState(false);
  const [texte, setTexte] = useState("");

  useEffect(() => {
    setTraitees(lireTraitees());
  }, []);

  if (traitees === null) return null;

  const etape = getEtapesCycleProches(10).find((e) => !traitees.includes(e.id));
  if (!etape) return null;

  function marquerTraitee(id: string) {
    const next = [...(traitees ?? []), id];
    setTraitees(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function enregistrer() {
    if (!texte.trim()) return;
    ajouterEnrichissement(texte.trim(), "saison");
    marquerTraitee(etape!.id);
    toast.success("Ajouté à votre charte narrative");
    setTexte("");
    setReponseOuverte(false);
  }

  return (
    <Card className="border border-gold/30 bg-gold/5 shadow-none">
      <CardContent className="flex flex-col gap-3 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
            <Sprout className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">
              {etape.libelle}
              {etape.dansJours === 0 ? " aujourd'hui" : etape.dansJours === 1 ? " demain" : ` dans ${etape.dansJours} jours`}
              {" "}— un souvenir à partager ?
            </p>
            {!reponseOuverte && (
              <div className="mt-2 flex gap-2">
                <Button size="sm" className="bg-gold text-white hover:bg-gold/90" onClick={() => setReponseOuverte(true)}>
                  Répondre
                </Button>
                <Button size="sm" variant="ghost" className="text-stone" onClick={() => marquerTraitee(etape.id)}>
                  Pas maintenant
                </Button>
              </div>
            )}
          </div>
          {!reponseOuverte && (
            <button
              onClick={() => marquerTraitee(etape.id)}
              aria-label="Fermer"
              className="text-stone hover:text-ink"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {reponseOuverte && (
          <div className="flex gap-2 pl-11">
            <Input
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              placeholder="Un mot, une anecdote de cette période…"
              className="flex-1"
            />
            <Button size="sm" className="bg-vine text-white hover:bg-vine/90" onClick={enregistrer}>
              Enregistrer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
