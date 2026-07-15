"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { GlassEmptyState } from "@/components/glass/glass-empty-state";
import type { ClientAvecStats } from "@/lib/clients-api";

const SEGMENTS_FILTRABLES = ["Actif", "Occasionnel", "Nouveau", "Gros acheteur"] as const;

function BadgeSegment({ segment }: { segment: string }) {
  const estInactif = segment.startsWith("Inactif");
  const classes = estInactif
    ? "border-red-400/30 bg-red-400/10 text-red-200"
    : segment === "Gros acheteur"
      ? "border-gold/30 bg-gold/10 text-gold"
      : segment === "Actif"
        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
        : "border-white/15 bg-white/5 text-white/60";
  return <span className={`rounded-full border px-2 py-0.5 text-xs ${classes}`}>{segment}</span>;
}

export function ListeClientsGlass({ clients }: { clients: ClientAvecStats[] }) {
  const [recherche, setRecherche] = useState("");
  const [filtreSegment, setFiltreSegment] = useState<string | null>(null);

  const filtres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return clients.filter((c) => {
      if (filtreSegment && !c.segments.some((s) => (filtreSegment === "Actif" ? s === "Actif" : s === filtreSegment))) return false;
      if (q && !c.nom.toLowerCase().includes(q) && !(c.email ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [clients, recherche, filtreSegment]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un nom, un e-mail…"
            className="h-9 w-full rounded-full border border-white/15 bg-white/10 pl-9 pr-3 text-sm text-white outline-none focus:border-white/30"
          />
        </div>
        <button
          onClick={() => setFiltreSegment(null)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${!filtreSegment ? "border-gold/40 bg-gold/20 text-gold" : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"}`}
        >
          Tous
        </button>
        {SEGMENTS_FILTRABLES.map((s) => (
          <button
            key={s}
            onClick={() => setFiltreSegment(s)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${filtreSegment === s ? "border-gold/40 bg-gold/20 text-gold" : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"}`}
          >
            {s}
          </button>
        ))}
        <span className="ml-auto text-xs text-white/50">{filtres.length} client{filtres.length > 1 ? "s" : ""}</span>
      </div>

      {filtres.length === 0 ? (
        <GlassEmptyState icon={Users} title="Aucun client" description="Créez votre premier client ou importez un fichier CSV." />
      ) : (
        <div className="flex flex-col gap-1">
          {filtres.map((c) => (
            <Link key={c.id} href={`/dashboard/clients/${c.id}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-xs font-medium text-white">
                {c.nom
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((m) => m[0]?.toUpperCase())
                  .join("")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white">{c.nom}</p>
                <p className="truncate text-xs text-white/55">{c.email ?? c.telephone ?? "Aucune coordonnée"}</p>
              </div>
              <span className="shrink-0 text-xs text-white/50">
                {c.stats.montantTotal > 0 ? `${c.stats.montantTotal.toFixed(0)} €` : "—"}
              </span>
              <div className="flex shrink-0 gap-1">
                {c.segments.map((s) => (
                  <BadgeSegment key={s} segment={s} />
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
