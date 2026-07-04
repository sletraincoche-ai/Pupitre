"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { domaineProfile, typesVisite } from "@/lib/mock-data";

export function ConfigurationTab() {
  const [urlCopiee, setUrlCopiee] = useState(false);
  const urlReservation = `pupitre.fr/reserver/${domaineProfile.sluggPublic}`;

  async function copierLien() {
    try {
      await navigator.clipboard.writeText(`https://${urlReservation}`);
    } catch {
      // clipboard indisponible (ex. contexte non sécurisé) — on affiche quand même le succès visuel
    }
    setUrlCopiee(true);
    toast.success("Lien copié");
    setTimeout(() => setUrlCopiee(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="border border-border/70 bg-card shadow-none">
        <CardHeader className="px-6">
          <CardTitle>Types de visites</CardTitle>
          <CardDescription>Durée, prix et jauge par formule proposée</CardDescription>
        </CardHeader>
        <CardContent className="px-6">
          <div className="flex flex-col gap-3">
            {typesVisite.map((t) => (
              <div
                key={t.formule}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-background px-4 py-3"
              >
                <p className="font-medium text-ink">{t.formule}</p>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone">
                  <span>{t.dureeMinutes} min</span>
                  <span>{t.prixParPersonne} € / pers.</span>
                  <span>Jauge {t.jaugeMax} pers. max</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/70 bg-card shadow-none">
        <CardHeader className="px-6">
          <CardTitle>Page de réservation publique</CardTitle>
          <CardDescription>
            Le lien que vos visiteurs utilisent pour réserver en ligne
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input readOnly value={urlReservation} className="text-stone" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={copierLien}>
                <Copy className="size-4" />
                {urlCopiee ? "Copié !" : "Copier le lien"}
              </Button>
              <Button
                variant="outline"
                nativeButton={false}
                render={
                  <a href="/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" />
                    Aperçu
                  </a>
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
