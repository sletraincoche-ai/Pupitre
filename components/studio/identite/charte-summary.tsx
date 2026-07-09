"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/glass/glass-panel";
import { useIdentity } from "@/lib/identity-context";
import type { OrigineEnrichissement } from "@/lib/mock-data";

const libellesOrigine: Record<OrigineEnrichissement, string> = {
  test: "Test initial",
  saison: "Saison",
  cuvee: "Nouvelle cuvée",
  visite: "Visite",
};

export function CharteSummary({ onModifier }: { onModifier: () => void }) {
  const { charte } = useIdentity();
  if (!charte) return null;

  const piliersInitiaux = charte.piliers.filter((p) => p.origine === "test");
  const journal = charte.piliers.filter((p) => p.origine !== "test");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <GlassPanel intensity="strong" className="overflow-hidden p-0">
        <div className="flex items-center gap-3 border-b border-white/15 px-6 py-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-gold">
            <FileText className="size-4" />
          </span>
          <div>
            <p className="text-base font-semibold tracking-tight text-white">Charte narrative</p>
            <p className="text-xs text-white/70">Utilisée pour chaque génération du Studio</p>
          </div>
        </div>

        {charte.ton && (
          <div className="border-b border-white/10 px-6 py-4">
            <p className="text-xs font-medium tracking-wide text-white/60 uppercase">Ton</p>
            <p className="mt-1.5 text-sm text-white/90">{charte.ton}</p>
          </div>
        )}

        {piliersInitiaux.length > 0 && (
          <div className="border-b border-white/10 px-6 py-4">
            <p className="text-xs font-medium tracking-wide text-white/60 uppercase">
              Piliers d&apos;histoires ({piliersInitiaux.length})
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              {piliersInitiaux.map((p) => (
                <li key={p.id} className="text-sm text-white/90">
                  {p.texte}
                </li>
              ))}
            </ul>
          </div>
        )}

        {charte.vocabulaire.length > 0 && (
          <div className="border-b border-white/10 px-6 py-4">
            <p className="text-xs font-medium tracking-wide text-white/60 uppercase">Vocabulaire</p>
            <p className="mt-1.5 text-sm text-white/90">{charte.vocabulaire.join(" · ")}</p>
          </div>
        )}

        {charte.interdits.length > 0 && (
          <div className="px-6 py-4">
            <p className="text-xs font-medium tracking-wide text-white/60 uppercase">Interdits</p>
            <p className="mt-1.5 text-sm text-white/90">{charte.interdits.join(" · ")}</p>
          </div>
        )}

        <div className="border-t border-white/10 px-6 py-4">
          <Button
            variant="outline"
            className="rounded-lg border-white/30 bg-transparent text-white hover:bg-white/10"
            onClick={onModifier}
          >
            Modifier mes réponses
          </Button>
        </div>
      </GlassPanel>

      {journal.length > 0 && (
        <GlassPanel intensity="regular" className="overflow-hidden p-0">
          <p className="border-b border-white/10 px-6 py-3 text-xs font-medium tracking-wide text-white/60 uppercase">
            Journal d&apos;enrichissement ({journal.length})
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs tracking-wide text-white/60 uppercase">
                  <th className="px-6 py-2.5 font-medium">Date</th>
                  <th className="px-6 py-2.5 font-medium">Origine</th>
                  <th className="px-6 py-2.5 font-medium">Entrée</th>
                </tr>
              </thead>
              <tbody>
                {journal.map((p) => (
                  <tr key={p.id} className="border-b border-white/10 last:border-b-0">
                    <td className="px-6 py-2.5 text-xs whitespace-nowrap text-white/70 tabular-nums">{p.date}</td>
                    <td className="px-6 py-2.5 text-xs whitespace-nowrap text-white/85">
                      {libellesOrigine[p.origine]}
                    </td>
                    <td className="px-6 py-2.5 text-white/90">{p.texte}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      )}
    </div>
  );
}
