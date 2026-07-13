"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Send, CalendarClock, FileText } from "lucide-react";
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
import { useConnexionsModal } from "@/lib/connexions-modal-context";
import { usePublications } from "@/lib/publications-context";
import { formatOrigine } from "@/lib/fiches";
import { suggestionsHashtags } from "@/lib/hashtags";
import { ProgrammerModal, type ChoixProgrammation } from "@/components/studio/programmer/programmer-modal";
import type { PublicationReelle } from "@/lib/publications";
import type { ReseauPlateforme, FormatContenu } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function versContenuEdite(p: PublicationReelle): ContenuEdite {
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
  const { connecte, instagram } = useMetaConnection();
  const { ouvrir: ouvrirConnexions } = useConnexionsModal();
  const { publications, hydrated, mettreAJour, creer } = usePublications();
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [edited, setEdited] = useState<ContenuEdite | null>(null);
  const [programmerOuvert, setProgrammerOuvert] = useState(false);

  const enFile = (p: PublicationReelle) => p.statut === "brouillon" || p.statut === "programmee";
  const queue = publications.filter(enFile);
  const enCours = sourceId ? queue.find((p) => p.id === sourceId) : undefined;

  function charger(publication: PublicationReelle) {
    setSourceId(publication.id);
    setEdited(versContenuEdite(publication));
  }

  // Sélectionne automatiquement le premier élément de la file dès qu'elle
  // est chargée, tant que rien n'a encore été choisi.
  useEffect(() => {
    if (hydrated && !sourceId && queue.length > 0) {
      charger(queue[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, sourceId, queue.length]);

  function selectionnerSuivant(idTraite: string) {
    const reste = publications.filter((p) => enFile(p) && p.id !== idTraite);
    if (reste[0]) {
      charger(reste[0]);
    } else {
      setSourceId(null);
      setEdited(null);
    }
  }

  async function publierMaintenant() {
    if (!sourceId || !edited) return;
    const canalPret = edited.plateforme === "Instagram" ? instagram.connecte : connecte;
    if (!canalPret) {
      ouvrirConnexions();
      return;
    }
    const traite = sourceId;
    const publication = await mettreAJour(sourceId, { ...edited, statut: "publiee" });
    if (!publication) {
      toast.error("Échec de la publication.");
      return;
    }
    const endpoint = publication.plateforme === "Facebook" ? "/api/studio/publish-facebook" : "/api/studio/publish-instagram";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ publicationId: publication.id }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? `La publication ${publication.plateforme} a échoué.`);
      return;
    }
    toast.success(`Publié sur ${edited.plateforme}`);
    selectionnerSuivant(traite);
  }

  function programmer() {
    if (!sourceId || !edited) return;
    if (!connecte) {
      ouvrirConnexions();
      return;
    }
    setProgrammerOuvert(true);
  }

  async function confirmerProgrammation({ plateformes, dateHeure }: ChoixProgrammation) {
    if (!sourceId || !edited) return;
    const traite = sourceId;
    const scheduledFor = dateHeure.toISOString();
    const [premiere, ...autres] = plateformes;

    const publication = await mettreAJour(sourceId, {
      ...edited,
      plateforme: premiere,
      statut: "programmee",
      scheduledFor,
    });
    if (!publication) {
      toast.error("Échec de la programmation.");
      return;
    }
    for (const plateforme of autres) {
      await creer({ ...edited, plateforme, statut: "programmee", scheduledFor });
    }

    toast.success(
      `Programmé sur ${plateformes.join(" et ")} pour le ${dateHeure.toLocaleString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}`
    );
    setProgrammerOuvert(false);
    selectionnerSuivant(traite);
  }

  async function enregistrerBrouillon() {
    if (!sourceId || !edited) return;
    const publication = await mettreAJour(sourceId, { ...edited });
    if (publication) toast.success("Brouillon enregistré");
    else toast.error("Échec de l'enregistrement.");
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
    <GlassPageShell fill>
      <GlassPageHeader title="Réseaux sociaux" subtitle="Instagram et Facebook, un seul éditeur." />

      <GlassThreeColumns className="lg:min-h-0 lg:flex-1 gap-4">
        <GlassColumnPanel label={`File d'attente (${queue.length})`}>
          {!hydrated ? (
            <p className="py-8 text-center text-sm text-white/50">Chargement…</p>
          ) : queue.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/50">
              File vide. Composez une publication depuis Création.
            </p>
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
            <div className="flex flex-col gap-4">
              {enCours && <p className="font-mono text-xs text-white/55">{formatOrigine()}</p>}

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 rounded-xl border border-white/20 p-1">
                  <button
                    onClick={() => setPlateforme("Instagram")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-medium transition-colors",
                      edited.plateforme === "Instagram" ? "bg-white/15 text-white" : "text-white/60"
                    )}
                  >
                    <InstagramBadge className="size-4" />
                    Instagram
                  </button>
                  <button
                    onClick={() => setPlateforme("Facebook")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-medium transition-colors",
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
                      "rounded-lg px-2.5 py-1 text-sm font-medium transition-colors",
                      edited.format !== "story" ? "bg-white/15 text-white" : "text-white/60"
                    )}
                  >
                    Post
                  </button>
                  <button
                    onClick={() => setFormat("story")}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-sm font-medium transition-colors",
                      edited.format === "story" ? "bg-white/15 text-white" : "text-white/60"
                    )}
                  >
                    Story
                  </button>
                </div>
              </div>

              <EditPanel edited={edited} onChange={setEdited} suggestionsHashtags={suggestionsHashtags(charte)} />

              <div className="flex flex-wrap gap-2 border-t border-white/15 pt-3">
                <Button className="rounded-lg bg-gold text-white hover:bg-gold/90" onClick={publierMaintenant}>
                  <Send className="size-4" />
                  Publier maintenant
                </Button>
                <Button
                  variant="outline"
                  className="rounded-lg border-white/25 bg-transparent text-white hover:bg-white/10"
                  onClick={programmer}
                >
                  <CalendarClock className="size-4" />
                  Programmer
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
                  onClick={enregistrerBrouillon}
                >
                  <FileText className="size-4" />
                  Enregistrer brouillon
                </Button>
              </div>
            </div>
          )}
        </GlassColumnPanel>
      </GlassThreeColumns>

      {edited && (
        <ProgrammerModal
          open={programmerOuvert}
          onClose={() => setProgrammerOuvert(false)}
          plateformeInitiale={edited.plateforme}
          onConfirmer={confirmerProgrammation}
        />
      )}
    </GlassPageShell>
  );
}
