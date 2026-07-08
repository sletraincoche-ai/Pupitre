"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConsentScreen({ onAccepter }: { onAccepter: () => void }) {
  const [coche, setCoche] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 border border-border bg-card px-6 py-10 text-center">
      <span className="flex size-11 items-center justify-center rounded-[3px] border border-vine/30 text-vine">
        <ShieldCheck className="size-5" />
      </span>
      <p className="font-heading text-xl text-ink">Protection de vos données</p>
      <p className="max-w-md text-sm leading-relaxed text-stone">
        Vos réponses sont stockées dans une base de données protégée et ne servent qu&apos;à
        personnaliser les contenus générés pour votre domaine. Elles ne sont jamais partagées
        avec d&apos;autres comptes, et sont définitivement supprimées si vous supprimez votre
        compte.
      </p>

      <label className="mt-2 flex max-w-md items-start gap-3 text-left">
        <input
          type="checkbox"
          checked={coche}
          onChange={(e) => setCoche(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 rounded border-input accent-vine"
        />
        <span className="text-sm text-ink">
          J&apos;ai compris comment mes réponses seront utilisées et j&apos;accepte qu&apos;elles
          soient enregistrées pour personnaliser le Studio de mon domaine.
        </span>
      </label>

      <Button
        className="mt-2 rounded-[3px] bg-vine text-white hover:bg-vine/90"
        disabled={!coche}
        onClick={onAccepter}
      >
        J&apos;ai compris, commencer
      </Button>
    </div>
  );
}
