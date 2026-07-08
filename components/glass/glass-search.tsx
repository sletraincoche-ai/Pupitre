"use client";

import { Search } from "lucide-react";

// Toujours fixe par rapport au viewport, jamais au conteneur de contenu —
// ainsi le déploiement du menu latéral ne la déplace jamais.
export function GlassSearchBar() {
  return (
    <div className="fixed inset-x-20 top-5 z-20 lg:inset-x-auto lg:left-1/2 lg:w-full lg:max-w-md lg:-translate-x-1/2 lg:px-4">
      <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-black/40 px-4 py-2.5 text-white shadow-[0_8px_32px_rgba(0,0,0,0.28)] backdrop-blur-xl backdrop-saturate-150">
        <Search className="size-4 shrink-0 text-white/60" />
        <input
          placeholder="Rechercher un client, une visite, un contenu…"
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/55"
        />
      </div>
    </div>
  );
}
