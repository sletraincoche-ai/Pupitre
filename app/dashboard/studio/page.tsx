"use client";

import Image from "next/image";
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
import { publicationsSociales, emailCampagnes, avisGoogle, photosDomaine } from "@/lib/mock-data";

// Trois photos réelles du domaine, réparties sur les 6 vignettes du bloc
// Photos plutôt que de répéter la même icône.
const photosVariees = [
  "/images/glass/photos/feuille-contre-jour.jpg",
  "/images/glass/photos/rangs-de-vigne.jpg",
  "/images/glass/photos/cave-tonneaux.jpg",
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
    <GlassPageShell>
      <div className="studio-glass-grid" style={{ minHeight: "calc(100vh - 8.5rem)" }}>
        <GlassBlock
          href="/dashboard/studio/reseaux-sociaux"
          area="reseaux"
          intensity="strong"
          badge={reseauxEnAttente.length}
          backgroundImage="/images/glass/instagram-post.png"
          backgroundImageAlt=""
          icon={
            <span className="flex items-center gap-1">
              <InstagramBadge className="size-5" />
              <FacebookBadge className="size-5" />
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
          icon={<Mail className="size-5" />}
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
          icon={<FcGoogle className="size-5" />}
          title="Avis Google"
          subtitle={`${avisEnAttente.length} avis à traiter`}
        />

        <div data-area="bande" className="flex flex-col gap-4 lg:flex-row">
          <Link href="/dashboard/studio/identite" className="group flex-1">
            <GlassPanel
              intensity="regular"
              className="relative flex h-full items-center justify-between gap-3 overflow-hidden px-6 py-5 transition-transform duration-300 ease-out hover:-translate-y-0.5"
            >
              <GlassSheen />
              <div className="relative z-10">
                <p className="text-base font-semibold tracking-tight text-white">Le test</p>
                <p className="mt-0.5 text-sm text-white/70">
                  {!identiteHydratee ? "—" : charte ? "Charte narrative prête" : "À compléter"}
                </p>
              </div>
              <ArrowRight className="relative z-10 size-4 shrink-0 text-white/60" />
            </GlassPanel>
          </Link>
          <Link href="/dashboard/studio/creation" className="group flex-1">
            <GlassPanel
              intensity="regular"
              className="relative flex h-full items-center justify-between gap-3 overflow-hidden px-6 py-5 transition-transform duration-300 ease-out hover:-translate-y-0.5"
            >
              <GlassSheen />
              <div className="relative z-10">
                <p className="text-base font-semibold tracking-tight text-white">Création</p>
                <p className="mt-0.5 text-sm text-white/70">Nouvelle publication</p>
              </div>
              <Plus className="relative z-10 size-4 shrink-0 text-white/60" />
            </GlassPanel>
          </Link>
        </div>

        <Link href="/dashboard/studio/photos" data-area="photos" className="group block min-h-0">
          <GlassPanel
            intensity="strong"
            className="relative flex h-full flex-col gap-4 overflow-hidden p-6 transition-transform duration-300 ease-out hover:-translate-y-0.5"
          >
            <GlassSheen />
            <p className="relative z-10 text-lg font-semibold tracking-tight text-white">Photos</p>
            <div className="grid grid-cols-3 gap-2">
              {photosDomaine.slice(0, 6).map((photo, i) => (
                <div key={photo.id} className="relative aspect-square overflow-hidden rounded-xl border border-white/10">
                  <Image
                    src={photosVariees[i % photosVariees.length]}
                    alt={photo.legende}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pt-3 pb-1">
                    <p className="text-center text-[9px] leading-tight text-white">{photo.legende}</p>
                  </div>
                </div>
              ))}
            </div>
            <span className="relative z-10 mt-auto flex items-center gap-1 text-sm font-medium text-white/80 group-hover:text-white">
              Voir toute la banque
              <ArrowRight className="size-3.5" />
            </span>
          </GlassPanel>
        </Link>
      </div>
    </GlassPageShell>
  );
}
