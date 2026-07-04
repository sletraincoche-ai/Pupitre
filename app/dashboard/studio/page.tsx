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
          badge={reseauxEnAttente.length}
          className="row-span-2 bg-gradient-to-br from-[#FEDA75]/25 via-[#D62976]/15 to-[#4F5BD5]/20 md:min-h-[280px]"
        >
          <div className="flex items-center gap-2">
            <InstagramBadge className="size-9" />
            <FacebookBadge className="size-9" />
          </div>
          <div>
            <p className="font-heading text-2xl text-ink">Réseaux sociaux</p>
            <p className="mt-1 text-sm text-stone">
              {reseauxEnAttente.length} contenu{reseauxEnAttente.length > 1 ? "s" : ""} prêt
              {reseauxEnAttente.length > 1 ? "s" : ""} à valider
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {reseauxEnAttente.slice(0, 3).map((p) => (
                <span
                  key={p.id}
                  className="flex items-center gap-1.5 rounded-full bg-card/70 px-3 py-1 text-xs font-medium text-ink"
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
            <span className="mt-4 flex items-center gap-1 text-sm font-medium text-ink">
              Ouvrir l&apos;atelier
              <ArrowRight className="size-4" />
            </span>
          </div>
        </StudioTile>

        <StudioTile
          href="/dashboard/studio/mail"
          badge={mailEnAttente.length}
          className="bg-gradient-to-br from-gold/25 to-gold/10"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-gold text-white">
            <Mail className="size-5" />
          </span>
          <div>
            <p className="font-heading text-xl text-ink">Mail</p>
            <p className="mt-1 text-sm text-stone">
              {mailEnAttente.length} campagne{mailEnAttente.length > 1 ? "s" : ""} prête
              {mailEnAttente.length > 1 ? "s" : ""}
            </p>
          </div>
        </StudioTile>

        <StudioTile
          href="/dashboard/studio/avis"
          badge={avisEnAttente.length}
          className="border border-border/70 bg-card"
        >
          <FcGoogle className="size-9" />
          <div>
            <p className="font-heading text-xl text-ink">Avis Google</p>
            <p className="mt-1 text-sm text-stone">
              {avisEnAttente.length} avis à traiter
            </p>
          </div>
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
