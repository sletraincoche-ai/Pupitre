"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Plus, Send, CalendarClock, FileText, Link2 } from "lucide-react";
import { InstagramBadge, FacebookBadge } from "@/components/studio/brand-icons";
import { PostPreview } from "@/components/studio/post-preview";
import { QueueCard } from "@/components/studio/reseaux/queue-card";
import { EditPanel, type ContenuEdite } from "@/components/studio/reseaux/edit-panel";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { useIdentity } from "@/lib/identity-context";
import { useMetaConnection } from "@/lib/meta-connection-context";
import { getNumeroParId, formatOrigine } from "@/lib/fiches";
import { suggestionsHashtags } from "@/lib/hashtags";
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
  return (
    <Suspense fallback={null}>
      <ReseauxSociauxContent />
    </Suspense>
  );
}

function ReseauxSociauxContent() {
  const { charte } = useIdentity();
  const { connecte, info } = useMetaConnection();
  const searchParams = useSearchParams();
  const [queue, setQueue] = useState(publicationsInitiales);
  const [sourceId, setSourceId] = useState<string | null>(queue[0]?.id ?? null);
  const [edited, setEdited] = useState<ContenuEdite | null>(queue[0] ? versContenuEdite(queue[0]) : null);

  function charger(publication: PublicationSociale) {
    setSourceId(publication.id);
    setEdited(versContenuEdite(publication));
  }

  function creerManuellement() {
    setSourceId(null);
    setEdited({ ...vide, hashtags: suggestionsHashtags(charte).slice(0, 2) });
  }

  // Le bloc "Création" du Studio ouvre directement l'éditeur vierge, sans
  // passer par la sélection d'une suggestion dans la file.
  useEffect(() => {
    if (searchParams.get("nouveau") === "1") {
      creerManuellement();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const source = sourceId ? queue.find((p) => p.id === sourceId) : undefined;
  const numero = sourceId ? getNumeroParId(sourceId) : undefined;

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
        <Button variant="outline" className="rounded-[3px]" onClick={creerManuellement}>
          <Plus className="size-4" />
          Créer une publication
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium tracking-wide text-stone uppercase">
            File d&apos;attente ({queue.length})
          </p>
          {queue.length === 0 ? (
            <p className="border border-dashed border-border py-8 text-center text-sm text-stone">
              File vide. Créez une publication.
            </p>
          ) : (
            <div className="divide-y divide-border border border-border">
              {queue.map((p) => (
                <QueueCard key={p.id} publication={p} active={sourceId === p.id} onClick={() => charger(p)} />
              ))}
            </div>
          )}
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
                <div className="flex items-center gap-1 border border-border p-1">
                  <button
                    onClick={() => setPlateforme("Instagram")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 text-sm font-medium transition-colors",
                      edited.plateforme === "Instagram" ? "bg-vine text-white" : "text-stone"
                    )}
                  >
                    <InstagramBadge className="size-4" />
                    Instagram
                  </button>
                  <button
                    onClick={() => setPlateforme("Facebook")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 text-sm font-medium transition-colors",
                      edited.plateforme === "Facebook" ? "bg-vine text-white" : "text-stone"
                    )}
                  >
                    <FacebookBadge className="size-4" />
                    Facebook
                  </button>
                </div>

                <div className="flex items-center gap-1 border border-border p-1">
                  <button
                    onClick={() => setFormat("post")}
                    className={cn(
                      "rounded-[2px] px-3 py-1.5 text-sm font-medium transition-colors",
                      edited.format !== "story" ? "bg-vine text-white" : "text-stone"
                    )}
                  >
                    Post
                  </button>
                  <button
                    onClick={() => setFormat("story")}
                    className={cn(
                      "rounded-[2px] px-3 py-1.5 text-sm font-medium transition-colors",
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
                  <div>
                    <p className="font-heading text-lg text-ink">
                      {numero ? `Fiche N°${numero}` : "Nouvelle fiche"}
                    </p>
                    <p className="font-mono text-xs text-stone">
                      {formatOrigine(source?.declencheur)}
                    </p>
                  </div>

                  <EditPanel edited={edited} onChange={setEdited} suggestionsHashtags={suggestionsHashtags(charte)} />

                  <div className="flex flex-wrap gap-2 border-t border-border pt-5">
                    {connecte ? (
                      <Button
                        className="rounded-[3px] bg-vine text-white hover:bg-vine/90"
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
                        className="rounded-[3px] bg-vine text-white hover:bg-vine/90"
                        nativeButton={false}
                        render={
                          <Link href="/dashboard/parametres">
                            <Link2 className="size-4" />
                            Connecter mes comptes
                          </Link>
                        }
                      />
                    )}
                    <Button variant="outline" className="rounded-[3px]" onClick={() => retirerDeLaFile("Publication programmée")}>
                      <CalendarClock className="size-4" />
                      Programmer
                    </Button>
                    <Button
                      variant="ghost"
                      className="rounded-[3px]"
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
