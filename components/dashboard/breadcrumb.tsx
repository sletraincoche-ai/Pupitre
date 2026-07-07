"use client";

import { usePathname } from "next/navigation";

const routeLabels: Record<string, string> = {
  dashboard: "Tableau de bord",
  clients: "Clients",
  visites: "Œnotourisme",
  studio: "Studio",
  cave: "Cave",
  agenda: "Agenda",
  parametres: "Paramètres",
  international: "Cap International",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean).slice(1); // drop leading "dashboard"

  const crumbs =
    segments.length === 0
      ? ["Tableau de bord"]
      : segments.map((segment) => routeLabels[segment] ?? segment);

  return (
    <div className="flex min-w-0 items-center gap-1.5 text-sm">
      {crumbs.map((crumb, index) => (
        <span key={index} className="flex items-center gap-1.5">
          {index > 0 && <span className="text-stone/50">/</span>}
          <span
            className={
              index === crumbs.length - 1
                ? "truncate font-medium text-ink"
                : "truncate text-stone"
            }
          >
            {crumb}
          </span>
        </span>
      ))}
    </div>
  );
}
