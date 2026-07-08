"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <span className="flex size-8 items-center justify-center rounded-[3px] border border-gold/30 text-gold">
            <FileText className="size-4" />
          </span>
          <div>
            <p className="font-heading text-lg text-ink">Charte narrative</p>
            <p className="font-mono text-xs text-stone">Utilisée pour chaque génération du Studio</p>
          </div>
        </div>

        {charte.ton && (
          <div className="border-b border-border px-6 py-4">
            <p className="text-xs font-medium tracking-wide text-stone uppercase">Ton</p>
            <p className="mt-1.5 text-sm text-ink">{charte.ton}</p>
          </div>
        )}

        {piliersInitiaux.length > 0 && (
          <div className="border-b border-border px-6 py-4">
            <p className="text-xs font-medium tracking-wide text-stone uppercase">
              Piliers d&apos;histoires ({piliersInitiaux.length})
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              {piliersInitiaux.map((p) => (
                <li key={p.id} className="text-sm text-ink">
                  {p.texte}
                </li>
              ))}
            </ul>
          </div>
        )}

        {charte.vocabulaire.length > 0 && (
          <div className="border-b border-border px-6 py-4">
            <p className="text-xs font-medium tracking-wide text-stone uppercase">Vocabulaire</p>
            <p className="mt-1.5 text-sm text-ink">{charte.vocabulaire.join(" · ")}</p>
          </div>
        )}

        {charte.interdits.length > 0 && (
          <div className="px-6 py-4">
            <p className="text-xs font-medium tracking-wide text-stone uppercase">Interdits</p>
            <p className="mt-1.5 text-sm text-ink">{charte.interdits.join(" · ")}</p>
          </div>
        )}

        <div className="border-t border-border px-6 py-4">
          <Button variant="outline" className="rounded-[3px]" onClick={onModifier}>
            Modifier mes réponses
          </Button>
        </div>
      </div>

      {journal.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-stone uppercase">
            Journal d&apos;enrichissement ({journal.length})
          </p>
          <div className="overflow-x-auto border border-border">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs tracking-wide text-stone uppercase">
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Origine</th>
                  <th className="px-4 py-2.5 font-medium">Entrée</th>
                </tr>
              </thead>
              <tbody>
                {journal.map((p) => (
                  <tr key={p.id} className="border-b border-border/60 last:border-b-0">
                    <td className="px-4 py-2.5 font-mono text-xs whitespace-nowrap text-stone tabular-nums">
                      {p.date}
                    </td>
                    <td className="px-4 py-2.5 text-xs whitespace-nowrap text-ink">
                      {libellesOrigine[p.origine]}
                    </td>
                    <td className="px-4 py-2.5 text-ink">{p.texte}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
