"use client";

import Link from "next/link";
import { Mail, FileText, Plus, ArrowRight, LayoutDashboard, Users, GlassWater, CalendarDays, Warehouse, Settings } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { GlassBackground } from "@/components/glass/glass-background";
import { GlassSearchBar } from "@/components/glass/glass-search";
import { GlassSidebar, type GlassNavGroup } from "@/components/glass/glass-sidebar";
import { GlassPanel } from "@/components/glass/glass-panel";
import { GlassBlock } from "@/components/glass/glass-block";
import { InstagramBadge, FacebookBadge } from "@/components/studio/brand-icons";
import { PhotoTile } from "@/components/studio/photo-tile";
import { TunnelSequence } from "@/components/studio/tunnel/tunnel-sequence";
import { useOnboarding } from "@/lib/onboarding-context";
import { useIdentity } from "@/lib/identity-context";
import {
  publicationsSociales,
  emailCampagnes,
  avisGoogle,
  photosDomaine,
  totalContenusStudioEnAttente,
} from "@/lib/mock-data";

const navGroups: GlassNavGroup[] = [
  {
    label: "Gestion",
    items: [
      { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
      { href: "/dashboard/clients", label: "Clients", icon: Users },
      { href: "/dashboard/visites", label: "Visites", icon: GlassWater },
      { href: "/dashboard/agenda", label: "Agenda", icon: CalendarDays },
      { href: "/dashboard/cave", label: "Cave", icon: Warehouse },
    ],
  },
  {
    label: "Marketing",
    items: [{ href: "/dashboard/studio", label: "Studio", icon: FileText, badge: totalContenusStudioEnAttente }],
  },
  {
    label: "Domaine",
    items: [{ href: "/dashboard/parametres", label: "Paramètres", icon: Settings }],
  },
];

export default function StudioPage() {
  const { hydrated, tunnelTermine } = useOnboarding();
  const { hydrated: identiteHydratee, charte } = useIdentity();

  if (!hydrated) return null;

  if (!tunnelTermine) {
    return (
      <div className="flex flex-col gap-8">
        <TunnelSequence />
      </div>
    );
  }

  const reseauxEnAttente = publicationsSociales.filter((p) => p.statut === "En attente");
  const mailEnAttente = emailCampagnes.filter((e) => e.statut === "En attente");
  const avisEnAttente = avisGoogle.filter((a) => a.statut === "En attente");

  return (
    <div className="fixed inset-0 z-40 overflow-hidden">
      <GlassBackground src="/images/glass/vignoble.jpg" alt="Vigne à contre-jour" />
      <GlassSearchBar />

      <div className="flex h-full w-full">
        <GlassSidebar groups={navGroups} />

        <main className="min-w-0 flex-1 overflow-y-auto p-4">
          <div className="mx-auto mt-16 max-w-6xl">
            <div className="studio-glass-grid" style={{ minHeight: "calc(100vh - 8.5rem)" }}>
              <GlassBlock
                href="/dashboard/studio/reseaux-sociaux"
                area="reseaux"
                intensity="regular"
                badge={reseauxEnAttente.length}
                icon={
                  <span className="flex items-center gap-1">
                    <InstagramBadge className="size-5" />
                    <FacebookBadge className="size-5" />
                  </span>
                }
                title="Réseaux sociaux"
                subtitle={`${reseauxEnAttente.length} contenu${reseauxEnAttente.length > 1 ? "s" : ""} prêt${reseauxEnAttente.length > 1 ? "s" : ""} à valider`}
              >
                <div className="flex min-w-0 flex-col gap-2">
                  {reseauxEnAttente.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80"
                    >
                      {p.plateforme === "Instagram" ? (
                        <InstagramBadge className="size-3.5 shrink-0" />
                      ) : (
                        <FacebookBadge className="size-3.5 shrink-0" />
                      )}
                      <span className="min-w-0 truncate">{p.legende}</span>
                    </div>
                  ))}
                </div>
              </GlassBlock>

              <GlassBlock
                href="/dashboard/studio/mail"
                area="email"
                intensity="regular"
                badge={mailEnAttente.length}
                icon={<Mail className="size-5" />}
                title="Email"
                subtitle={`${mailEnAttente.length} campagne${mailEnAttente.length > 1 ? "s" : ""} prête${mailEnAttente.length > 1 ? "s" : ""}`}
              />

              <GlassBlock
                href="/dashboard/studio/avis"
                area="avis"
                intensity="regular"
                badge={avisEnAttente.length}
                icon={<FcGoogle className="size-5" />}
                title="Avis Google"
                subtitle={`${avisEnAttente.length} avis à traiter`}
              />

              <div data-area="bande" className="flex flex-col gap-4 lg:flex-row">
                <Link href="/dashboard/studio/identite" className="flex-1">
                  <GlassPanel
                    intensity="regular"
                    className="flex h-full items-center justify-between gap-3 px-6 py-5 transition-transform duration-300 ease-out hover:-translate-y-0.5"
                  >
                    <div>
                      <p className="text-base font-semibold tracking-tight text-white">Le test</p>
                      <p className="mt-0.5 text-sm text-white/65">
                        {!identiteHydratee ? "—" : charte ? "Charte narrative prête" : "À compléter"}
                      </p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-white/50" />
                  </GlassPanel>
                </Link>
                <Link href="/dashboard/studio/reseaux-sociaux?nouveau=1" className="flex-1">
                  <GlassPanel
                    intensity="regular"
                    className="flex h-full items-center justify-between gap-3 px-6 py-5 transition-transform duration-300 ease-out hover:-translate-y-0.5"
                  >
                    <div>
                      <p className="text-base font-semibold tracking-tight text-white">Création</p>
                      <p className="mt-0.5 text-sm text-white/65">Nouvelle publication</p>
                    </div>
                    <Plus className="size-4 shrink-0 text-white/50" />
                  </GlassPanel>
                </Link>
              </div>

              <div data-area="photos" className="min-h-0">
                <GlassPanel intensity="regular" className="flex h-full flex-col gap-4 p-6">
                  <p className="text-lg font-semibold tracking-tight text-white">Photos</p>
                  <div className="grid grid-cols-3 gap-2">
                    {photosDomaine.slice(0, 6).map((photo) => (
                      <div key={photo.id} className="aspect-square overflow-hidden rounded-xl border border-white/10">
                        <PhotoTile photoId={photo.id} className="size-full" />
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/dashboard/studio/photos"
                    className="mt-auto flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white"
                  >
                    Voir toute la banque
                    <ArrowRight className="size-3.5" />
                  </Link>
                </GlassPanel>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
