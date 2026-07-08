"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Users, GlassWater, Sparkles } from "lucide-react";
import { visites, publicationsSociales, emailCampagnes, avisGoogle } from "@/lib/mock-data";
import { useClients } from "@/lib/clients-context";

export type SearchResultGroup = {
  label: string;
  icon: typeof Users;
  results: { id: string; label: string; sublabel: string }[];
  onSelect: (id: string) => void;
};

// Logique de recherche partagée entre la barre standard du dashboard
// (GlobalSearch) et sa variante en verre du Studio — un seul calcul des
// groupes de résultats, pas de logique dupliquée.
export function useGlobalSearchGroups(query: string): SearchResultGroup[] {
  const router = useRouter();
  const { clients } = useClients();
  const q = query.trim().toLowerCase();

  if (!q) return [];

  return [
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
  ].filter((group) => group.results.length > 0);
}
