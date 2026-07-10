"use client";

import Link from "next/link";
import { Mail, Plus, ArrowRight } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { GlassPageShell } from "@/components/glass/glass-page-shell";
import { GlassPanel } from "@/components/glass/glass-panel";
import { GlassBlock } from "@/components/glass/glass-block";
import { GlassSheen } from "@/components/glass/glass-sheen";
import { InstagramBadge, FacebookBadge } from "@/components/studio/brand-icons";
import { TunnelSequence } from "@/components/studio/tunnel/tunnel-sequence";
import { useOnboarding } from "@/lib/onboarding-context";
import { useIdentity } from "@/lib/identity-context";
import { usePhotos } from "@/lib/photos-context";
import { usePublications } from "@/lib/publications-context";
import { emailCampagnes, avisGoogle } from "@/lib/mock-data";

export default function StudioPage() {
  const { hydrated, tunnelTermine } = useOnboarding();
  const { hydrated: identiteHydratee, charte } = useIdentity();
  const { photos } = usePhotos();
  const { publications } = usePublications();

  if (!hydrated) return null;

  if (!tunnelTermine) {
    return (
      <GlassPageShell>
        <div className="flex flex-1 items-center justify-center py-10">
          <TunnelSequence />
        </div>
      </GlassPageShell>
    );
  }

  const reseauxEnAttente = publications.filter((p) => p.statut === "brouillon");
  const mailEnAttente = emailCampagnes.filter((e) => e.statut === "En attente");
  const avisEnAttente = avisGoogle.filter((a) => a.statut === "En attente");

  return (
    <GlassPageShell fill>
      {/* Grille contrainte à la hauteur restante du viewport (lg:flex-1
          dans la coquille en mode `fill`) — les rangées de blocs sont donc
          compressées, pas seulement leur largeur, pour tenir sans scroll
          à 1440×900. */}
      <div className="studio-glass-grid lg:min-h-0 lg:flex-1">
        <GlassBlock
          href="/dashboard/studio/reseaux-sociaux"
          area="reseaux"
          intensity="strong"
          badge={reseauxEnAttente.length}
          backgroundImage="/images/glass/instagram-post.png"
          backgroundImageAlt=""
          imageMinHeight={90}
          panelClassName="gap-2 p-4"
          icon={
            <span className="flex items-center gap-1">
              <InstagramBadge className="size-4" />
              <FacebookBadge className="size-4" />
            </span>
          }
          title="Réseaux sociaux"
          subtitle={`${reseauxEnAttente.length} contenu${reseauxEnAttente.length > 1 ? "s" : ""} prêt${reseauxEnAttente.length > 1 ? "s" : ""} à valider`}
        />

        <GlassBlock
          href="/dashboard/studio/mail"
          area="email"
          intensity="strong"
          badge={mailEnAttente.length}
          backgroundImage="/images/glass/mail-preview.png"
          backgroundImageAlt=""
          imageMinHeight={70}
          panelClassName="gap-2 p-4"
          icon={<Mail className="size-4" />}
          title="Email"
          subtitle={`${mailEnAttente.length} campagne${mailEnAttente.length > 1 ? "s" : ""} prête${mailEnAttente.length > 1 ? "s" : ""}`}
        />

        <GlassBlock
          href="/dashboard/studio/avis"
          area="avis"
          intensity="regular"
          badge={avisEnAttente.length}
          backgroundImage="/images/glass/avis-google.png"
          backgroundImageAlt=""
          imageMinHeight={70}
          panelClassName="gap-2 p-4"
          icon={<FcGoogle className="size-4" />}
          title="Avis Google"
          subtitle={`${avisEnAttente.length} avis à traiter`}
        />

        <div data-area="bande" className="flex flex-col gap-2 lg:flex-row">
          <Link href="/dashboard/studio/identite" className="group flex-1">
            <GlassPanel
              intensity="regular"
              className="relative flex h-full items-center justify-between gap-3 overflow-hidden px-5 py-3 transition-transform duration-300 ease-out hover:-translate-y-0.5"
            >
              <GlassSheen />
              <div className="relative z-10">
                <p className="text-sm font-semibold tracking-tight text-white">Le test</p>
                <p className="mt-0.5 text-xs text-white/70">
                  {!identiteHydratee ? "—" : charte ? "Charte narrative prête" : "À compléter"}
                </p>
              </div>
              <ArrowRight className="relative z-10 size-4 shrink-0 text-white/60" />
            </GlassPanel>
          </Link>
          <Link href="/dashboard/studio/creation" className="group flex-1">
            <GlassPanel
              intensity="regular"
              className="relative flex h-full items-center justify-between gap-3 overflow-hidden px-5 py-3 transition-transform duration-300 ease-out hover:-translate-y-0.5"
            >
              <GlassSheen />
              <div className="relative z-10">
                <p className="text-sm font-semibold tracking-tight text-white">Création</p>
                <p className="mt-0.5 text-xs text-white/70">Nouvelle publication</p>
              </div>
              <Plus className="relative z-10 size-4 shrink-0 text-white/60" />
            </GlassPanel>
          </Link>
        </div>

        <Link href="/dashboard/studio/photos" data-area="photos" className="group block min-h-0">
          <GlassPanel
            intensity="strong"
            className="relative flex h-full flex-col gap-2 overflow-hidden p-4 transition-transform duration-300 ease-out hover:-translate-y-0.5"
          >
            <GlassSheen />
            <p className="relative z-10 text-sm font-semibold tracking-tight text-white">Photos</p>
            {photos.length === 0 ? (
              <p className="relative z-10 text-xs text-white/60">
                Aucune photo pour l&apos;instant — ajoutez les premières photos de votre domaine.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {photos.slice(0, 6).map((photo) => (
                  <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt={photo.legende} className="size-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pt-3 pb-1">
                      <p className="text-center text-[9px] leading-tight text-white">{photo.legende}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <span className="relative z-10 mt-auto flex items-center gap-1 text-xs font-medium text-white/80 group-hover:text-white">
              Voir toute la banque
              <ArrowRight className="size-3.5" />
            </span>
          </GlassPanel>
        </Link>
      </div>
    </GlassPageShell>
  );
}
