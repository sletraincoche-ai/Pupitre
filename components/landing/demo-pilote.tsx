"use client";

import { useMemo, useState } from "react";
import { Check, X, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const demoKpis = [
  { label: "Chiffre d'affaires", value: "312 400 €", delta: "+8,4%", up: true },
  { label: "Bouteilles vendues", value: "18 260", delta: "+3,1%", up: true },
  { label: "Visites œnotourisme", value: "142", delta: "-4,2%", up: false },
  { label: "Clients actifs", value: "684", delta: "+12,7%", up: true },
];

const demoBars = [58, 64, 70, 78, 100, 48, 52, 60, 66, 72, 76, 82];

type DemoTag = "fidele" | "dormant" | "etranger";

const demoClients: {
  nom: string;
  pays: string;
  drapeau: string;
  statut: "VIP" | "Actif" | "À relancer";
  tags: DemoTag[];
}[] = [
  { nom: "Isabelle Fontaine", pays: "France", drapeau: "🇫🇷", statut: "VIP", tags: ["fidele"] },
  { nom: "James Whitmore", pays: "Royaume-Uni", drapeau: "🇬🇧", statut: "Actif", tags: ["etranger"] },
  { nom: "Haruto Sinclair", pays: "Japon", drapeau: "🇯🇵", statut: "À relancer", tags: ["etranger"] },
  { nom: "Marc Delacroix", pays: "France", drapeau: "🇫🇷", statut: "À relancer", tags: ["dormant"] },
  { nom: "Sofia Bergqvist", pays: "Suède", drapeau: "🇸🇪", statut: "Actif", tags: ["etranger"] },
];

const demoFilters: { key: "tous" | DemoTag; label: string }[] = [
  { key: "tous", label: "Tous" },
  { key: "fidele", label: "Fidèles" },
  { key: "dormant", label: "Dormants" },
  { key: "etranger", label: "Étrangers" },
];

const statusStyles: Record<string, string> = {
  VIP: "bg-gold/15 text-gold",
  Actif: "bg-vine/10 text-vine",
  "À relancer": "bg-destructive/10 text-destructive",
};

const initialDemoPosts = [
  {
    id: "d1",
    plateforme: "Instagram",
    texte:
      "☀️ Les premières grappes rosissent sous le soleil de juillet... #ChampagnePupitre",
  },
  {
    id: "d2",
    plateforme: "Newsletter",
    texte:
      "Découvrez notre Millésime 2016 en édition limitée, disponible cette semaine.",
  },
  {
    id: "d3",
    plateforme: "Facebook",
    texte: "Ouverture exceptionnelle du caveau ce week-end pour une dégustation verticale.",
  },
];

function DemoDashboard() {
  const max = Math.max(...demoBars);
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {demoKpis.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-border/70 bg-background p-4">
            <p className="text-xs text-stone">{kpi.label}</p>
            <p className="mt-1 font-heading text-xl text-ink">{kpi.value}</p>
            <span
              className={cn(
                "mt-1 flex items-center gap-0.5 text-xs font-medium",
                kpi.up ? "text-vine" : "text-destructive"
              )}
            >
              {kpi.up ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {kpi.delta}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-border/70 bg-background p-4">
        <p className="text-xs text-stone">Ventes des 12 derniers mois</p>
        <div className="mt-3 flex h-24 gap-2">
          {demoBars.map((value, i) => (
            <div key={i} className="flex h-full flex-1 flex-col justify-end">
              <div
                className="w-full rounded-t-sm bg-gold/80"
                style={{ height: `${(value / max) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DemoCrm() {
  const [filter, setFilter] = useState<"tous" | DemoTag>("tous");
  const filtered = useMemo(
    () =>
      filter === "tous"
        ? demoClients
        : demoClients.filter((c) => c.tags.includes(filter)),
    [filter]
  );

  return (
    <div className="p-6">
      <div className="flex flex-wrap gap-2">
        {demoFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === f.key
                ? "border-vine bg-vine text-white"
                : "border-border bg-background text-stone hover:border-vine/40 hover:text-vine"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="mt-4 overflow-hidden rounded-lg border border-border/70 bg-background">
        {filtered.map((client, i) => (
          <div
            key={client.nom}
            className={cn(
              "flex items-center justify-between px-4 py-3 text-sm",
              i !== filtered.length - 1 && "border-b border-border/60"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-vine/10 text-xs font-medium text-vine">
                {client.nom
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <span className="text-ink">{client.nom}</span>
            </div>
            <span className="hidden text-stone sm:inline">
              {client.drapeau} {client.pays}
            </span>
            <Badge variant="outline" className={cn("border-transparent", statusStyles[client.statut])}>
              {client.statut}
            </Badge>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-stone">
            Aucun client dans ce segment.
          </p>
        )}
      </div>
    </div>
  );
}

function DemoStudio() {
  const [posts, setPosts] = useState(initialDemoPosts);

  return (
    <div className="p-6">
      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-lg border border-border/70 bg-background p-4 transition-opacity"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-vine">{post.plateforme}</span>
            </div>
            <p className="mt-1.5 text-sm text-ink">{post.texte}</p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                className="bg-vine text-white hover:bg-vine/90"
                onClick={() => setPosts((prev) => prev.filter((p) => p.id !== post.id))}
              >
                <Check className="size-3.5" />
                Valider
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-stone hover:text-destructive"
                onClick={() => setPosts((prev) => prev.filter((p) => p.id !== post.id))}
              >
                <X className="size-3.5" />
                Ignorer
              </Button>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="rounded-lg border border-dashed border-border/70 bg-background px-4 py-8 text-center text-sm text-stone">
            File de validation vide. Nouvelles propositions demain matin. 🎉
          </p>
        )}
      </div>
    </div>
  );
}

export function DemoPiloteSection() {
  return (
    <section id="demo" className="bg-background py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <p className="text-sm font-medium tracking-[0.2em] text-gold uppercase">
            Démo pilote
          </p>
          <h2 className="mt-4 font-heading text-3xl text-vine lg:text-4xl">
            Essayez le pilote, ici, tout de suite.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-stone">
            Changez d&apos;onglet, filtrez les clients, validez une
            publication. C&apos;est exactement l&apos;interface que vous
            aurez au quotidien.
          </p>
        </div>

        <Reveal delay={0.1} className="mt-14">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl shadow-vine/5">
            <div className="flex items-center gap-2 border-b border-border/70 bg-muted/60 px-4 py-3">
              <span className="size-2.5 rounded-full bg-destructive/40" />
              <span className="size-2.5 rounded-full bg-gold/50" />
              <span className="size-2.5 rounded-full bg-vine/40" />
              <span className="ml-3 rounded-md bg-background px-3 py-1 text-xs text-stone">
                pupitre.app/dashboard
              </span>
            </div>

            <Tabs defaultValue="dashboard">
              <div className="border-b border-border/70 px-4 pt-3">
                <TabsList variant="line">
                  <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
                  <TabsTrigger value="crm">CRM</TabsTrigger>
                  <TabsTrigger value="studio">Studio IA</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="dashboard">
                <DemoDashboard />
              </TabsContent>
              <TabsContent value="crm">
                <DemoCrm />
              </TabsContent>
              <TabsContent value="studio">
                <DemoStudio />
              </TabsContent>
            </Tabs>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
