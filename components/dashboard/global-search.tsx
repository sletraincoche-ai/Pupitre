"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Users, GlassWater, Sparkles } from "lucide-react";
import { visites, publicationsSociales, emailCampagnes, avisGoogle } from "@/lib/mock-data";
import { useClients } from "@/lib/clients-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useClickOutside } from "@/lib/use-click-outside";

type ResultGroup = {
  label: string;
  icon: typeof Users;
  results: { id: string; label: string; sublabel: string }[];
  onSelect: (id: string) => void;
};

export function GlobalSearch() {
  const router = useRouter();
  const { clients } = useClients();
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

  const q = query.trim().toLowerCase();

  const groups: ResultGroup[] = q
    ? [
        {
          label: "Clients",
          icon: Users,
          results: clients
            .filter(
              (c) =>
                c.nom.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                c.pays.toLowerCase().includes(q)
            )
            .slice(0, 3)
            .map((c) => ({ id: c.id, label: c.nom, sublabel: c.pays })),
          onSelect: (id: string) => {
            router.push(`/dashboard/clients/${id}`);
          },
        },
        {
          label: "Visites",
          icon: GlassWater,
          results: visites
            .filter((v) => v.client.toLowerCase().includes(q))
            .slice(0, 3)
            .map((v) => ({ id: v.id, label: v.client, sublabel: v.date })),
          onSelect: (id: string) => {
            const visite = visites.find((v) => v.id === id);
            router.push("/dashboard/visites");
            toast.info(`Ouverture de la visite : ${visite?.client}`);
          },
        },
        {
          label: "Contenus",
          icon: Sparkles,
          results: [
            ...publicationsSociales
              .filter((p) => p.legende.toLowerCase().includes(q) || p.plateforme.toLowerCase().includes(q))
              .map((p) => ({ id: `pub:${p.id}`, label: `${p.plateforme} — ${p.format}`, sublabel: p.legende })),
            ...emailCampagnes
              .filter((e) => e.objet.toLowerCase().includes(q) || e.corps.toLowerCase().includes(q))
              .map((e) => ({ id: `mail:${e.id}`, label: e.objet, sublabel: e.segment })),
            ...avisGoogle
              .filter((a) => a.texte.toLowerCase().includes(q) || a.auteur.toLowerCase().includes(q))
              .map((a) => ({ id: `avis:${a.id}`, label: `Avis de ${a.auteur}`, sublabel: a.texte })),
          ].slice(0, 3),
          onSelect: (id: string) => {
            const [type] = id.split(":");
            const route =
              type === "pub"
                ? "/dashboard/studio/reseaux-sociaux"
                : type === "mail"
                  ? "/dashboard/studio/mail"
                  : "/dashboard/studio/avis";
            router.push(route);
          },
        },
      ].filter((group) => group.results.length > 0)
    : [];

  const showPanel = focused && q.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Rechercher un client, une visite, un contenu…"
          className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-14 text-sm outline-none placeholder:text-stone focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[0.65rem] font-medium text-stone">
          ⌘K
        </kbd>
      </div>

      {showPanel && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-xl border border-border/70 bg-card shadow-xl">
          {loading && (
            <div className="flex flex-col gap-3 p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {!loading && groups.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-stone">
              Aucun résultat pour « {query} ».
            </p>
          )}

          {!loading &&
            groups.map((group) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.label} className="border-b border-border/60 py-2 last:border-0">
                  <p className="px-4 py-1 text-[0.7rem] font-medium tracking-wide text-stone uppercase">
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
                      className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-muted/60"
                    >
                      <GroupIcon className="size-4 shrink-0 text-vine" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ink">
                          {result.label}
                        </span>
                        <span className="block truncate text-xs text-stone">
                          {result.sublabel}
                        </span>
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
