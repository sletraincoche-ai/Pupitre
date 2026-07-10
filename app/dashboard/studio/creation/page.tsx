"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, CalendarClock, FileText, TestTube2, Mail as MailIcon } from "lucide-react";
import { InstagramBadge, FacebookBadge } from "@/components/studio/brand-icons";
import { PostPreview } from "@/components/studio/post-preview";
import { InboxPreview } from "@/components/studio/mail/inbox-preview";
import { EditPanel, type ContenuEdite } from "@/components/studio/reseaux/edit-panel";
import { MailEditPanel, segmentsDisponibles, type EmailEdite } from "@/components/studio/mail/mail-edit-panel";
import { Button } from "@/components/ui/button";
import { GlassPageShell } from "@/components/glass/glass-page-shell";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassThreeColumns, GlassColumnPanel } from "@/components/glass/glass-column-panel";
import { useIdentity } from "@/lib/identity-context";
import { useMetaConnection } from "@/lib/meta-connection-context";
import { useGmailConnection } from "@/lib/gmail-connection-context";
import { useConnexionsModal } from "@/lib/connexions-modal-context";
import { BadgeNonConnecte } from "@/components/studio/connexions/badge-non-connecte";
import { useClients } from "@/lib/clients-context";
import { usePublications } from "@/lib/publications-context";
import { suggestionsHashtags } from "@/lib/hashtags";
import { ProgrammerModal, type ChoixProgrammation } from "@/components/studio/programmer/programmer-modal";
import type { ReseauPlateforme, FormatContenu } from "@/lib/mock-data";
import type { StatutPublication } from "@/lib/publications";
import { cn } from "@/lib/utils";

type Canal = "reseaux" | "email";

const contenuVide: ContenuEdite = {
  plateforme: "Instagram",
  format: "post",
  photos: [],
  legende: "",
  hashtags: [],
};

const emailVide: EmailEdite = {
  objet: "",
  corps: "",
  segment: "Tous les clients",
  nombreDestinataires: 0,
};

export default function CreationPage() {
  const { charte } = useIdentity();
  const { connecte, info } = useMetaConnection();
  const { connecte: gmailConnecte } = useGmailConnection();
  const { ouvrir: ouvrirConnexions } = useConnexionsModal();
  const { clients } = useClients();
  const { creer } = usePublications();
  const [canal, setCanal] = useState<Canal>("reseaux");
  const [contenuReseaux, setContenuReseaux] = useState<ContenuEdite>(contenuVide);
  const [contenuEmail, setContenuEmail] = useState<EmailEdite>({ ...emailVide, nombreDestinataires: clients.length });
  const [programmerOuvert, setProgrammerOuvert] = useState(false);

  function setPlateforme(plateforme: ReseauPlateforme) {
    setContenuReseaux((c) => ({ ...c, plateforme }));
  }

  function setFormat(format: FormatContenu) {
    setContenuReseaux((c) => ({ ...c, format }));
  }

  function changerSegment() {
    const index = segmentsDisponibles.findIndex((s) => s.label === contenuEmail.segment);
    const suivant = segmentsDisponibles[(index + 1) % segmentsDisponibles.length];
    const tag = suivant.tag;
    const nombre = tag ? clients.filter((c) => c.tags.includes(tag)).length : clients.length;
    setContenuEmail((e) => ({ ...e, segment: suivant.label, nombreDestinataires: nombre }));
  }

  async function publierReseaux(statut: StatutPublication, message: string) {
    if (statut !== "brouillon" && !connecte) {
      ouvrirConnexions();
      return;
    }
    const publication = await creer({ ...contenuReseaux, statut });
    if (!publication) {
      toast.error("Échec de l'enregistrement.");
      return;
    }
    toast.success(message);
    setContenuReseaux(contenuVide);
  }

  function ouvrirProgrammation() {
    if (!connecte) {
      ouvrirConnexions();
      return;
    }
    setProgrammerOuvert(true);
  }

  async function confirmerProgrammation({ plateformes, dateHeure }: ChoixProgrammation) {
    const scheduledFor = dateHeure.toISOString();
    for (const plateforme of plateformes) {
      const publication = await creer({ ...contenuReseaux, plateforme, statut: "programmee", scheduledFor });
      if (!publication) {
        toast.error("Échec de la programmation.");
        return;
      }
    }
    toast.success(
      `Programmé sur ${plateformes.join(" et ")} pour le ${dateHeure.toLocaleString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}`
    );
    setProgrammerOuvert(false);
    setContenuReseaux(contenuVide);
  }

  function envoyerEmail(message: string, requiertConnexion = true) {
    if (requiertConnexion && !gmailConnecte) {
      ouvrirConnexions();
      return;
    }
    toast.success(message);
    setContenuEmail({ ...emailVide, nombreDestinataires: clients.length });
  }

  return (
    <GlassPageShell fill>
      <GlassPageHeader title="Création" subtitle="Composez une publication de zéro, sur le canal de votre choix." />

      <GlassThreeColumns className="lg:min-h-0 lg:flex-1">
        <GlassColumnPanel label="Canal">
          <div className="flex flex-col gap-2">
            <div
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                canal === "reseaux" ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/5"
              )}
            >
              <button onClick={() => setCanal("reseaux")} className="flex flex-1 items-center gap-2.5 text-left">
                <span className="flex items-center gap-1">
                  <InstagramBadge className="size-4" />
                  <FacebookBadge className="size-4" />
                </span>
                Réseaux sociaux
              </button>
              {!connecte && <BadgeNonConnecte />}
            </div>
            <div
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                canal === "email" ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/5"
              )}
            >
              <button onClick={() => setCanal("email")} className="flex flex-1 items-center gap-2.5 text-left">
                <span className="flex size-4 items-center justify-center rounded-md bg-white/10 text-white">
                  <MailIcon className="size-2.5" />
                </span>
                Email
              </button>
              {!gmailConnecte && <BadgeNonConnecte />}
            </div>
          </div>

          {canal === "reseaux" && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-medium tracking-wide text-white/60 uppercase">Format</p>
              <div className="flex items-center gap-1 rounded-xl border border-white/20 p-1">
                <button
                  onClick={() => setFormat("post")}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    contenuReseaux.format !== "story" ? "bg-white/15 text-white" : "text-white/60"
                  )}
                >
                  Post
                </button>
                <button
                  onClick={() => setFormat("story")}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    contenuReseaux.format === "story" ? "bg-white/15 text-white" : "text-white/60"
                  )}
                >
                  Story
                </button>
              </div>
              <p className="mt-4 mb-2 text-xs font-medium tracking-wide text-white/60 uppercase">Plateforme</p>
              <div className="flex items-center gap-1 rounded-xl border border-white/20 p-1">
                <button
                  onClick={() => setPlateforme("Instagram")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    contenuReseaux.plateforme === "Instagram" ? "bg-white/15 text-white" : "text-white/60"
                  )}
                >
                  <InstagramBadge className="size-4" />
                  Instagram
                </button>
                <button
                  onClick={() => setPlateforme("Facebook")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    contenuReseaux.plateforme === "Facebook" ? "bg-white/15 text-white" : "text-white/60"
                  )}
                >
                  <FacebookBadge className="size-4" />
                  Facebook
                </button>
              </div>
            </div>
          )}
        </GlassColumnPanel>

        <GlassColumnPanel bare>
          {canal === "reseaux" ? (
            <PostPreview
              plateforme={contenuReseaux.plateforme}
              format={contenuReseaux.format}
              photos={contenuReseaux.photos}
              legende={contenuReseaux.legende}
              hashtags={contenuReseaux.hashtags}
              musique={contenuReseaux.musique}
            />
          ) : (
            <div className="w-full max-w-md">
              <InboxPreview objet={contenuEmail.objet} corps={contenuEmail.corps} />
            </div>
          )}
        </GlassColumnPanel>

        <GlassColumnPanel label="Détail & publication">
          <div className="flex flex-col gap-5">
            <p className="text-lg font-semibold tracking-tight text-white">Nouvelle fiche</p>

            {canal === "reseaux" ? (
              <>
                <EditPanel
                  edited={contenuReseaux}
                  onChange={setContenuReseaux}
                  suggestionsHashtags={suggestionsHashtags(charte)}
                />
                <div className="flex flex-wrap gap-2 border-t border-white/15 pt-5">
                  <Button
                    className="rounded-lg bg-gold text-white hover:bg-gold/90"
                    onClick={() =>
                      publierReseaux("publiee", `Publié sur ${contenuReseaux.plateforme}${info?.demo ? " (démo)" : ""}`)
                    }
                  >
                    <Send className="size-4" />
                    Publier maintenant
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-lg border-white/25 bg-transparent text-white hover:bg-white/10"
                    onClick={ouvrirProgrammation}
                  >
                    <CalendarClock className="size-4" />
                    Programmer
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
                    onClick={() => publierReseaux("brouillon", "Brouillon enregistré")}
                  >
                    <FileText className="size-4" />
                    Enregistrer brouillon
                  </Button>
                </div>
              </>
            ) : (
              <>
                <MailEditPanel edited={contenuEmail} onChange={setContenuEmail} onChangerSegment={changerSegment} />
                <div className="flex flex-wrap gap-2 border-t border-white/15 pt-5">
                  <Button
                    className="rounded-lg bg-gold text-white hover:bg-gold/90"
                    onClick={() => envoyerEmail(`Envoyé à ${contenuEmail.nombreDestinataires} clients`)}
                  >
                    <Send className="size-4" />
                    Envoyer aux {contenuEmail.nombreDestinataires} clients
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-lg border-white/25 bg-transparent text-white hover:bg-white/10"
                    onClick={() => envoyerEmail("Test envoyé à votre adresse")}
                  >
                    <TestTube2 className="size-4" />
                    M&apos;envoyer un test
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
                    onClick={() => envoyerEmail("Brouillon enregistré", false)}
                  >
                    <FileText className="size-4" />
                    Enregistrer brouillon
                  </Button>
                </div>
              </>
            )}
          </div>
        </GlassColumnPanel>
      </GlassThreeColumns>

      <ProgrammerModal
        open={programmerOuvert}
        onClose={() => setProgrammerOuvert(false)}
        plateformeInitiale={contenuReseaux.plateforme}
        onConfirmer={confirmerProgrammation}
      />
    </GlassPageShell>
  );
}
