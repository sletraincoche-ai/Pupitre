"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Send, CalendarClock, FileText, Link2 } from "lucide-react";
import { InstagramBadge, FacebookBadge } from "@/components/studio/brand-icons";
import { PostPreview } from "@/components/studio/post-preview";
import { QueueCard } from "@/components/studio/reseaux/queue-card";
import { EditPanel, type ContenuEdite } from "@/components/studio/reseaux/edit-panel";
import { Button } from "@/components/ui/button";
import { GlassEmptyState } from "@/components/glass/glass-empty-state";
import { GlassPageShell } from "@/components/glass/glass-page-shell";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassThreeColumns, GlassColumnPanel } from "@/components/glass/glass-column-panel";
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
    <GlassPageShell fill>
      <GlassPageHeader title="Réseaux sociaux" subtitle="Instagram et Facebook, un seul éditeur." />

      <GlassThreeColumns className="lg:min-h-0 lg:flex-1">
        <GlassColumnPanel label={`File d'attente (${queue.length})`}>
          {queue.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/50">File vide.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {queue.map((p) => (
                <QueueCard key={p.id} publication={p} active={sourceId === p.id} onClick={() => charger(p)} />
              ))}
            </div>
          )}
        </GlassColumnPanel>

        <GlassColumnPanel bare>
          {!edited ? (
            <GlassEmptyState
              icon={FileText}
              title="Aucun contenu sélectionné"
              description="Choisissez une suggestion dans la file."
            />
          ) : (
            <PostPreview
              plateforme={edited.plateforme}
              format={edited.format}
              photos={edited.photos}
              legende={edited.legende}
              hashtags={edited.hashtags}
              musique={edited.musique}
            />
          )}
        </GlassColumnPanel>

        <GlassColumnPanel label="Détail & publication">
          {!edited ? (
            <p className="py-8 text-center text-sm text-white/50">—</p>
          ) : (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-lg font-semibold tracking-tight text-white">
                  {numero ? `Fiche N°${numero}` : "Nouvelle fiche"}
                </p>
                <p className="font-mono text-xs text-white/55">{formatOrigine(source?.declencheur)}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 rounded-xl border border-white/20 p-1">
                  <button
                    onClick={() => setPlateforme("Instagram")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      edited.plateforme === "Instagram" ? "bg-white/15 text-white" : "text-white/60"
                    )}
                  >
                    <InstagramBadge className="size-4" />
                    Instagram
                  </button>
                  <button
                    onClick={() => setPlateforme("Facebook")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      edited.plateforme === "Facebook" ? "bg-white/15 text-white" : "text-white/60"
                    )}
                  >
                    <FacebookBadge className="size-4" />
                    Facebook
                  </button>
                </div>

                <div className="flex items-center gap-1 rounded-xl border border-white/20 p-1">
                  <button
                    onClick={() => setFormat("post")}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      edited.format !== "story" ? "bg-white/15 text-white" : "text-white/60"
                    )}
                  >
                    Post
                  </button>
                  <button
                    onClick={() => setFormat("story")}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      edited.format === "story" ? "bg-white/15 text-white" : "text-white/60"
                    )}
                  >
                    Story
                  </button>
                </div>
              </div>

              <EditPanel edited={edited} onChange={setEdited} suggestionsHashtags={suggestionsHashtags(charte)} />

              <div className="flex flex-wrap gap-2 border-t border-white/15 pt-5">
                {connecte ? (
                  <Button
                    className="rounded-lg bg-gold text-white hover:bg-gold/90"
                    onClick={() =>
                      retirerDeLaFile(`Publié sur ${edited.plateforme}${info?.demo ? " (démo)" : ""}`)
                    }
                  >
                    <Send className="size-4" />
                    Publier maintenant
                  </Button>
                ) : (
                  <Button
                    className="rounded-lg bg-gold text-white hover:bg-gold/90"
                    nativeButton={false}
                    render={
                      <Link href="/dashboard/parametres">
                        <Link2 className="size-4" />
                        Connecter mes comptes
                      </Link>
                    }
                  />
                )}
                <Button
                  variant="outline"
                  className="rounded-lg border-white/25 text-white hover:bg-white/10"
                  onClick={() => retirerDeLaFile("Publication programmée")}
                >
                  <CalendarClock className="size-4" />
                  Programmer
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
                  onClick={() => toast.success("Brouillon enregistré")}
                >
                  <FileText className="size-4" />
                  Enregistrer brouillon
                </Button>
              </div>
            </div>
          )}
        </GlassColumnPanel>
      </GlassThreeColumns>
    </GlassPageShell>
  );
}
