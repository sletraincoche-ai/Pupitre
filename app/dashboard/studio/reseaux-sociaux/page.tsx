"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Plus, Send, CalendarClock, FileText, Sparkles, Link2 } from "lucide-react";
import { InstagramBadge, FacebookBadge } from "@/components/studio/brand-icons";
import { PostPreview } from "@/components/studio/post-preview";
import { QueueCard } from "@/components/studio/reseaux/queue-card";
import { EditPanel, type ContenuEdite } from "@/components/studio/reseaux/edit-panel";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { useIdentity } from "@/lib/identity-context";
import { useMetaConnection } from "@/lib/meta-connection-context";
import {
  publicationsSociales as publicationsInitiales,
  type PublicationSociale,
  type ReseauPlateforme,
  type FormatContenu,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function versContenuEdite(p: PublicationSociale): ContenuEdite {
  return {
    plateforme: p.plateforme,
    format: p.format,
    photos: p.photos,
    legende: p.legende,
    hashtags: p.hashtags,
    musique: p.musique,
  };
}

const vide: ContenuEdite = {
  plateforme: "Instagram",
  format: "post",
  photos: [],
  legende: "",
  hashtags: [],
};

export default function ReseauxSociauxPage() {
  const { charte } = useIdentity();
  const { connecte, info } = useMetaConnection();
  const [queue, setQueue] = useState(publicationsInitiales);
  const [sourceId, setSourceId] = useState<string | null>(queue[0]?.id ?? null);
  const [edited, setEdited] = useState<ContenuEdite | null>(queue[0] ? versContenuEdite(queue[0]) : null);

  function charger(publication: PublicationSociale) {
    setSourceId(publication.id);
    setEdited(versContenuEdite(publication));
  }

  function creerManuellement() {
    setSourceId(null);
    setEdited({
      ...vide,
      hashtags: charte?.vocabulaire.map((v) => v.replace(/[^a-zA-Z0-9À-ÿ]/g, "")).filter(Boolean) ?? [],
    });
  }

  function retirerDeLaFile(message: string) {
    if (sourceId) {
      setQueue((prev) => prev.filter((p) => p.id !== sourceId));
    }
    toast.success(message);
    const reste = queue.filter((p) => p.id !== sourceId);
    if (reste[0]) {
      charger(reste[0]);
    } else {
      setSourceId(null);
      setEdited(null);
    }
  }

  function setPlateforme(plateforme: ReseauPlateforme) {
    if (!edited) return;
    setEdited({ ...edited, plateforme });
  }

  function setFormat(format: FormatContenu) {
    if (!edited) return;
    setEdited({ ...edited, format });
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard/studio" className="flex w-fit items-center gap-1.5 text-sm text-stone hover:text-vine">
        <ArrowLeft className="size-4" />
        Retour au Studio
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl text-ink">Atelier réseaux sociaux</h1>
          <p className="mt-1 text-stone">Instagram et Facebook, un seul éditeur.</p>
        </div>
        <Button className="bg-vine text-white hover:bg-vine/90" onClick={creerManuellement}>
          <Plus className="size-4" />
          Créer une publication
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-stone">
            File d&apos;attente ({queue.length})
          </p>
          {queue.length === 0 && (
            <p className="rounded-xl border border-dashed border-border/70 bg-card py-8 text-center text-sm text-stone">
              File vide. Créez une publication.
            </p>
          )}
          {queue.map((p) => (
            <QueueCard key={p.id} publication={p} active={sourceId === p.id} onClick={() => charger(p)} />
          ))}
        </div>

        <div>
          {!edited ? (
            <EmptyState
              icon={Plus}
              title="Aucun contenu sélectionné"
              description="Choisissez une suggestion dans la file ou créez une publication de zéro."
            />
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-1 rounded-full border border-border/70 bg-card p-1">
                  <button
                    onClick={() => setPlateforme("Instagram")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                      edited.plateforme === "Instagram" ? "bg-vine text-white" : "text-stone"
                    )}
                  >
                    <InstagramBadge className="size-4" />
                    Instagram
                  </button>
                  <button
                    onClick={() => setPlateforme("Facebook")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                      edited.plateforme === "Facebook" ? "bg-vine text-white" : "text-stone"
                    )}
                  >
                    <FacebookBadge className="size-4" />
                    Facebook
                  </button>
                </div>

                <div className="flex items-center gap-1 rounded-full border border-border/70 bg-card p-1">
                  <button
                    onClick={() => setFormat("post")}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                      edited.format !== "story" ? "bg-vine text-white" : "text-stone"
                    )}
                  >
                    Post
                  </button>
                  <button
                    onClick={() => setFormat("story")}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                      edited.format === "story" ? "bg-vine text-white" : "text-stone"
                    )}
                  >
                    Story
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 xl:grid-cols-[300px_1fr]">
                <div className="flex justify-center xl:sticky xl:top-6 xl:self-start">
                  <PostPreview
                    plateforme={edited.plateforme}
                    format={edited.format}
                    photos={edited.photos}
                    legende={edited.legende}
                    hashtags={edited.hashtags}
                    musique={edited.musique}
                  />
                </div>

                <div className="flex flex-col gap-6">
                  {charte && (
                    <p className="flex items-center gap-1.5 rounded-lg bg-gold/10 px-3 py-2 text-xs font-medium text-gold">
                      <Sparkles className="size-3.5" />
                      Généré selon votre charte narrative — ton : {charte.ton}
                    </p>
                  )}

                  <EditPanel edited={edited} onChange={setEdited} />

                  <div className="flex flex-wrap gap-2 border-t border-border/60 pt-5">
                    {connecte ? (
                      <Button
                        className="bg-vine text-white hover:bg-vine/90"
                        onClick={() =>
                          retirerDeLaFile(
                            `Publié sur ${edited.plateforme}${info?.demo ? " (démo)" : ""}`
                          )
                        }
                      >
                        <Send className="size-4" />
                        Publier maintenant
                      </Button>
                    ) : (
                      <Button
                        className="bg-vine text-white hover:bg-vine/90"
                        nativeButton={false}
                        render={
                          <Link href="/dashboard/parametres">
                            <Link2 className="size-4" />
                            Connecter mes comptes
                          </Link>
                        }
                      />
                    )}
                    <Button variant="outline" onClick={() => retirerDeLaFile("Publication programmée")}>
                      <CalendarClock className="size-4" />
                      Programmer
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => toast.success("Brouillon enregistré")}
                    >
                      <FileText className="size-4" />
                      Enregistrer brouillon
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
