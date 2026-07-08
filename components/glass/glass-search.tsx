"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useClickOutside } from "@/lib/use-click-outside";
import { useGlobalSearchGroups } from "@/lib/use-global-search";

// Toujours fixe par rapport au viewport, jamais au conteneur de contenu —
// ainsi le déploiement du menu latéral ne la déplace jamais. Les marges
// mobiles sont asymétriques pour laisser la place au bouton hamburger à
// gauche et aux pastilles notification/profil à droite. Réutilise la
// même logique de recherche (useGlobalSearchGroups) que la barre
// standard du dashboard — mêmes résultats, habillage en verre.
export function GlassSearchBar() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setFocused(false));

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape") {
        setFocused(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, []);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const groups = useGlobalSearchGroups(query);
  const showPanel = focused && query.trim().length > 0;

  return (
    <div
      ref={containerRef}
      className="fixed top-5 right-32 left-20 z-20 lg:right-auto lg:left-1/2 lg:w-full lg:max-w-md lg:-translate-x-1/2 lg:px-4"
    >
      <div className="relative flex items-center gap-2.5 rounded-full border border-white/15 bg-black/25 px-4 py-2.5 text-white shadow-[0_8px_32px_rgba(0,0,0,0.28)] backdrop-blur-xl backdrop-saturate-150">
        <Search className="size-4 shrink-0 text-white/60" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Rechercher un client, une visite, un contenu…"
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/55"
        />
      </div>

      {showPanel && (
        <div className="absolute top-full right-0 left-0 z-40 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-white/15 bg-black/60 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl backdrop-saturate-150">
          {loading && (
            <div className="flex flex-col gap-3 p-4">
              <Skeleton className="h-4 w-24 bg-white/10" />
              <Skeleton className="h-10 w-full bg-white/10" />
              <Skeleton className="h-10 w-full bg-white/10" />
            </div>
          )}

          {!loading && groups.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-white/60">
              Aucun résultat pour « {query} ».
            </p>
          )}

          {!loading &&
            groups.map((group) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.label} className="border-b border-white/10 py-2 last:border-0">
                  <p className="px-4 py-1 text-[0.7rem] font-medium tracking-wide text-white/50 uppercase">
                    {group.label}
                  </p>
                  {group.results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => {
                        group.onSelect(result.id);
                        setFocused(false);
                        setQuery("");
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-white/10"
                    >
                      <GroupIcon className="size-4 shrink-0 text-gold" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-white">{result.label}</span>
                        <span className="block truncate text-xs text-white/55">{result.sublabel}</span>
                      </span>
                    </button>
                  ))}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
