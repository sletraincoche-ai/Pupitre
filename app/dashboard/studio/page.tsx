"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Mail, Plus, ArrowRight, Link2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { GlassPageShell } from "@/components/glass/glass-page-shell";
import { GlassPanel } from "@/components/glass/glass-panel";
import { GlassBlock } from "@/components/glass/glass-block";
import { GlassSheen } from "@/components/glass/glass-sheen";
import { InstagramBadge, FacebookBadge } from "@/components/studio/brand-icons";
import { TunnelSequence } from "@/components/studio/tunnel/tunnel-sequence";
import { BadgeNonConnecte } from "@/components/studio/connexions/badge-non-connecte";
import { NotificationCycle } from "@/components/studio/enrichissement/notification-cycle";
import { useOnboarding } from "@/lib/onboarding-context";
import { useIdentity } from "@/lib/identity-context";
import { usePhotos } from "@/lib/photos-context";
import { usePublications } from "@/lib/publications-context";
import { useMetaConnection } from "@/lib/meta-connection-context";
import { useGmailConnection } from "@/lib/gmail-connection-context";
import { useConnexionsModal } from "@/lib/connexions-modal-context";
import { emailCampagnes, avisGoogle } from "@/lib/mock-data";

export default function StudioPage() {
  const { hydrated, premierAcces } = useOnboarding();
  const { hydrated: identiteHydratee, charte } = useIdentity();
  const { photos } = usePhotos();
  const { publications } = usePublications();
  const { connecte: metaConnecte } = useMetaConnection();
  const { connecte: gmailConnecte } = useGmailConnection();
  const { ouvrir: ouvrirConnexions } = useConnexionsModal();
  const canauxConnectes = Number(metaConnecte) + Number(gmailConnecte);

  // Le tunnel "Bienvenu sur Studio AI" ne doit apparaître qu'au tout
  // premier accès à Studio IA pour ce compte, jamais aux visites
  // suivantes. `premierAcces` est un signal ponctuel posé côté serveur
  // uniquement sur la réponse qui vient de créer le rang onboarding_state
  // (voir cette route) — on fige ce choix initial une seule fois par
  // montage pour qu'un rafraîchissement de contexte ultérieur ne referme
  // pas le tunnel en cours d'interaction. La sortie du tunnel, elle,
  // passe par le callback direct `onTermine` (pas par `tunnelTermine`,
  // déjà vrai en base dès la création du rang et qui ne change donc plus
  // pendant cette même session). Le test d'identité, lui, reprend
  // toujours où il en était grâce à sa propre persistance.
  const [decision, setDecision] = useState<"attente" | "tunnel" | "dashboard">("attente");

  useEffect(() => {
    if (!hydrated || decision !== "attente") return;
    setDecision(premierAcces ? "tunnel" : "dashboard");
  }, [hydrated, premierAcces, decision]);

  if (decision === "attente") return null;

  if (decision === "tunnel") {
    return (
      <GlassPageShell>
        <div className="flex flex-1 items-center justify-center py-10">
          <TunnelSequence onTermine={() => setDecision("dashboard")} />
        </div>
      </GlassPageShell>
    );
  }

  const reseauxEnAttente = publications.filter((p) => p.statut === "brouillon");
  const mailEnAttente = emailCampagnes.filter((e) => e.statut === "En attente");
  const avisEnAttente = avisGoogle.filter((a) => a.statut === "En attente");

  return (
    <GlassPageShell fill>
      <NotificationCycle />
      {/* Grille contrainte à la hauteur restante du viewport (lg:flex-1
          dans la coquille en mode `fill`) — les rangées de blocs sont donc
          compressées, pas seulement leur largeur, pour tenir sans scroll
          à 1440×900. */}
      <div className="studio-glass-grid mt-3 lg:min-h-0 lg:flex-1">
        <GlassBlock
          href="/dashboard/studio/reseaux-sociaux"
          area="reseaux"
          intensity="strong"
          badge={reseauxEnAttente.length}
          topRight={!metaConnecte && <BadgeNonConnecte />}
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
          topRight={!gmailConnecte && <BadgeNonConnecte />}
          backgroundImage="/images/glass/mail-preview.png"
          backgroundImageAlt=""
          imageMinHeight={110}
          imageFit="cover"
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
          imageMinHeight={110}
          imageFit="cover"
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
          <button onClick={ouvrirConnexions} className="group flex-1 text-left">
            <GlassPanel
              intensity="regular"
              className="relative flex h-full items-center justify-between gap-3 overflow-hidden px-5 py-3 transition-transform duration-300 ease-out hover:-translate-y-0.5"
            >
              <GlassSheen />
              <div className="relative z-10">
                <p className="text-sm font-semibold tracking-tight text-white">Connexions</p>
                <p className="mt-0.5 text-xs text-white/70">{canauxConnectes}/2 canaux connectés</p>
              </div>
              <Link2 className="relative z-10 size-4 shrink-0 text-white/60" />
            </GlassPanel>
          </button>
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
