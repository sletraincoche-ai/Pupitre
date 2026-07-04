"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { domaineProfile, totalContenusStudioEnAttente, AUJOURDHUI } from "@/lib/mock-data";

const dateDuJour = (() => {
  const formatted = AUJOURDHUI.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
})();

export function WelcomeBanner() {
  const [salutation, setSalutation] = useState("Bonjour");

  useEffect(() => {
    const heure = new Date().getHours();
    setSalutation(heure >= 18 || heure < 5 ? "Bonsoir" : "Bonjour");
  }, []);

  const prenom = domaineProfile.nomVigneron.split(" ")[0];
  const contenusEnAttente = totalContenusStudioEnAttente;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-heading text-3xl text-ink">
          {salutation}, {prenom} — {domaineProfile.nomDomaine}
        </h1>
        <p className="mt-1 text-stone">{dateDuJour}</p>
      </div>

      {contenusEnAttente > 0 && (
        <Button
          className="h-11 shrink-0 bg-gold text-white hover:bg-gold/90"
          nativeButton={false}
          render={
            <Link href="/dashboard/studio">
              <Sparkles className="size-4" />
              {contenusEnAttente} contenu{contenusEnAttente > 1 ? "s" : ""} à valider
            </Link>
          }
        />
      )}
    </div>
  );
}
