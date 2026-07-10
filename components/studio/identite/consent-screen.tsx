"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/glass/glass-panel";
import { GlassSheen } from "@/components/glass/glass-sheen";

export function ConsentScreen({ onAccepter }: { onAccepter: () => void }) {
  const [coche, setCoche] = useState(false);

  return (
    <GlassPanel intensity="strong" className="relative mx-auto w-full max-w-xl overflow-hidden">
      <GlassSheen />
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 py-10 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-gold/15 text-gold">
          <ShieldCheck className="size-5" />
        </span>
        <p className="font-heading text-xl text-white">Protection de vos données</p>
        <p className="max-w-md text-sm leading-relaxed text-white/70">
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
            className="mt-0.5 size-4 shrink-0 rounded border-white/30 bg-white/10 accent-gold"
          />
          <span className="text-sm text-white/85">
            J&apos;ai compris comment mes réponses seront utilisées et j&apos;accepte qu&apos;elles
            soient enregistrées pour personnaliser le Studio de mon domaine.
          </span>
        </label>

        <Button className="mt-2 bg-gold text-white hover:bg-gold/90" disabled={!coche} onClick={onAccepter}>
          J&apos;ai compris, commencer
        </Button>
      </div>
    </GlassPanel>
  );
}
