"use client";

import { LayoutDashboard, Users, GlassWater, CalendarDays, Warehouse, Receipt, FileText, Settings } from "lucide-react";
import { GlassBackground } from "@/components/glass/glass-background";
import { GlassSearchBar } from "@/components/glass/glass-search";
import { GlassSidebar, type GlassNavGroup } from "@/components/glass/glass-sidebar";
import { GlassNotifications } from "@/components/glass/glass-notifications";
import { GlassProfile } from "@/components/glass/glass-profile";
import { totalContenusStudioEnAttente } from "@/lib/mock-data";
import { usePublications } from "@/lib/publications-context";
import { cn } from "@/lib/utils";

function useNavGroups(): GlassNavGroup[] {
  const { publications } = usePublications();
  const enAttente = totalContenusStudioEnAttente + publications.filter((p) => p.statut === "brouillon").length;

  return [
    {
      label: "Gestion",
      items: [
        { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
        { href: "/dashboard/clients", label: "Clients", icon: Users },
        { href: "/dashboard/visites", label: "Visites", icon: GlassWater },
        { href: "/dashboard/agenda", label: "Agenda", icon: CalendarDays },
        { href: "/dashboard/cave", label: "Cave", icon: Warehouse },
        { href: "/dashboard/facturation", label: "Facturation", icon: Receipt },
      ],
    },
    {
      label: "Marketing",
      items: [{ href: "/dashboard/studio", label: "Studio", icon: FileText, badge: enAttente }],
    },
    {
      label: "Domaine",
      items: [{ href: "/dashboard/parametres", label: "Paramètres", icon: Settings }],
    },
  ];
}

// Prise en charge complète de l'écran par le système de verre — fond
// plein écran, recherche/notifications/profil fixes, menu latéral.
// Partagée par l'accueil Studio et par chaque atelier pour que la même
// coquille (et la même nav) ne soit jamais dupliquée. `fill` : sur
// desktop, la page tient entièrement dans la hauteur du viewport (aucun
// scroll de page — chaque colonne défile en interne si besoin).
export function GlassPageShell({
  children,
  fill = false,
}: {
  children: React.ReactNode;
  fill?: boolean;
}) {
  const navGroups = useNavGroups();

  return (
    <div className="fixed inset-0 z-40 overflow-hidden">
      <GlassBackground src="/images/glass/vignoble.jpg" alt="Vigne à contre-jour" />
      <GlassSearchBar />
      <div className="fixed top-5 right-5 z-30 flex items-center gap-3">
        <GlassNotifications />
        <GlassProfile />
      </div>

      <div className="flex h-full w-full">
        <GlassSidebar groups={navGroups} />

        <main className={cn("min-w-0 flex-1 overflow-y-auto p-4 pt-20", fill && "lg:overflow-hidden")}>
          <div className={cn("mx-auto max-w-7xl", fill && "lg:flex lg:h-full lg:flex-col")}>{children}</div>
        </main>
      </div>
    </div>
  );
}
