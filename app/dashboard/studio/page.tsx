import { Mail, ArrowRight } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { StudioTile } from "@/components/studio/studio-tile";
import { InstagramBadge, FacebookBadge } from "@/components/studio/brand-icons";
import { IdentiteHomeCard } from "@/components/studio/identite-home-card";
import { ImageBank } from "@/components/studio/image-bank";
import {
  publicationsSociales,
  emailCampagnes,
  avisGoogle,
} from "@/lib/mock-data";

export default function StudioPage() {
  const reseauxEnAttente = publicationsSociales.filter((p) => p.statut === "En attente");
  const mailEnAttente = emailCampagnes.filter((e) => e.statut === "En attente");
  const avisEnAttente = avisGoogle.filter((a) => a.statut === "En attente");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl text-ink">Studio IA</h1>
        <p className="mt-1 text-stone">
          Chaque suggestion vient d&apos;un fait réel des autres modules — vous validez, rien ne part sans vous.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StudioTile
          href="/dashboard/studio/reseaux-sociaux"
          image="/images/studio/reseaux.png"
          imagePosition="38% center"
          badge={reseauxEnAttente.length}
          icons={
            <>
              <InstagramBadge className="size-8" />
              <FacebookBadge className="size-8" />
            </>
          }
          className="row-span-2 min-h-[240px] md:min-h-[280px]"
        >
          <p className="font-heading text-2xl">Réseaux sociaux</p>
          <p className="text-sm text-white/85">
            {reseauxEnAttente.length} contenu{reseauxEnAttente.length > 1 ? "s" : ""} prêt
            {reseauxEnAttente.length > 1 ? "s" : ""} à valider
          </p>
          <div className="flex flex-wrap gap-2">
            {reseauxEnAttente.slice(0, 3).map((p) => (
              <span
                key={p.id}
                className="flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-ink"
              >
                {p.plateforme === "Instagram" ? (
                  <InstagramBadge className="size-3.5" />
                ) : (
                  <FacebookBadge className="size-3.5" />
                )}
                {p.format === "post" ? "Post" : p.format === "story" ? "Story" : "Carrousel"}
              </span>
            ))}
          </div>
          <span className="mt-1 flex items-center gap-1 text-sm font-medium">
            Ouvrir l&apos;atelier
            <ArrowRight className="size-4" />
          </span>
        </StudioTile>

        <StudioTile
          href="/dashboard/studio/mail"
          image="/images/studio/mail.jpg"
          badge={mailEnAttente.length}
          icons={
            <span className="flex size-8 items-center justify-center rounded-lg bg-gold text-white">
              <Mail className="size-4" />
            </span>
          }
          className="min-h-[150px]"
        >
          <p className="font-heading text-xl">Mail</p>
          <p className="text-sm text-white/85">
            {mailEnAttente.length} campagne{mailEnAttente.length > 1 ? "s" : ""} prête
            {mailEnAttente.length > 1 ? "s" : ""}
          </p>
        </StudioTile>

        <StudioTile
          href="/dashboard/studio/avis"
          image="/images/studio/avis.jpg"
          imagePosition="center 30%"
          badge={avisEnAttente.length}
          icons={
            <span className="flex size-8 items-center justify-center rounded-lg bg-white">
              <FcGoogle className="size-5" />
            </span>
          }
          className="min-h-[150px]"
        >
          <p className="font-heading text-xl">Avis Google</p>
          <p className="text-sm text-white/85">{avisEnAttente.length} avis à traiter</p>
        </StudioTile>
      </div>

      <div className="border-t border-border/60 pt-8">
        <IdentiteHomeCard />
      </div>

      <div>
        <h2 className="mb-3 font-heading text-lg text-ink">Banque d&apos;images</h2>
        <ImageBank />
      </div>
    </div>
  );
}
