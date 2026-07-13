"use client";

import type { Produit } from "@/lib/cave-api";

export function ProduitSelect({
  produits,
  value,
  onChange,
  className = "",
}: {
  produits: Produit[];
  value: string;
  onChange: (produitId: string) => void;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30 ${className}`}
    >
      <option value="" disabled className="bg-ink text-white">
        Choisir une cuvée…
      </option>
      {produits
        .filter((p) => !p.archive)
        .map((p) => (
          <option key={p.id} value={p.id} className="bg-ink text-white">
            {p.nom}
            {p.millesime ? ` — ${p.millesime}` : ""}
          </option>
        ))}
    </select>
  );
}
