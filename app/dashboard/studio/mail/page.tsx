"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, TestTube2, FileText } from "lucide-react";
import { InboxPreview } from "@/components/studio/mail/inbox-preview";
import { MailQueueCard } from "@/components/studio/mail/mail-queue-card";
import {
  MailEditPanel,
  segmentsDisponibles,
  type EmailEdite,
} from "@/components/studio/mail/mail-edit-panel";
import { Button } from "@/components/ui/button";
import { GlassEmptyState } from "@/components/glass/glass-empty-state";
import { GlassPageShell } from "@/components/glass/glass-page-shell";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassThreeColumns, GlassColumnPanel } from "@/components/glass/glass-column-panel";
import { useClients } from "@/lib/clients-context";
import { useGmailConnection } from "@/lib/gmail-connection-context";
import { useConnexionsModal } from "@/lib/connexions-modal-context";
import { getNumeroParId, formatOrigine } from "@/lib/fiches";
import { emailCampagnes as emailCampagnesInitiales, type EmailCampagne } from "@/lib/mock-data";

function versEmailEdite(e: EmailCampagne): EmailEdite {
  return { objet: e.objet, corps: e.corps, segment: e.segment, nombreDestinataires: e.nombreDestinataires };
}

export default function MailPage() {
  const { clients } = useClients();
  const { connecte: gmailConnecte } = useGmailConnection();
  const { ouvrir: ouvrirConnexions } = useConnexionsModal();
  const [queue, setQueue] = useState(emailCampagnesInitiales);
  const [sourceId, setSourceId] = useState<string | null>(queue[0]?.id ?? null);
  const [edited, setEdited] = useState<EmailEdite | null>(queue[0] ? versEmailEdite(queue[0]) : null);

  function charger(campagne: EmailCampagne) {
    setSourceId(campagne.id);
    setEdited(versEmailEdite(campagne));
  }

  function terminer(message: string) {
    if (!gmailConnecte) {
      ouvrirConnexions();
      return;
    }
    if (sourceId) {
      setQueue((prev) => prev.filter((e) => e.id !== sourceId));
    }
    toast.success(message);
    const reste = queue.filter((e) => e.id !== sourceId);
    if (reste[0]) {
      charger(reste[0]);
    } else {
      setSourceId(null);
      setEdited(null);
    }
  }

  function changerSegment() {
    if (!edited) return;
    const index = segmentsDisponibles.findIndex((s) => s.label === edited.segment);
    const suivant = segmentsDisponibles[(index + 1) % segmentsDisponibles.length];
    const tag = suivant.tag;
    const nombre = tag ? clients.filter((c) => c.tags.includes(tag)).length : clients.length;
    setEdited({ ...edited, segment: suivant.label, nombreDestinataires: nombre });
  }

  const source = sourceId ? queue.find((e) => e.id === sourceId) : undefined;
  const numero = sourceId ? getNumeroParId(sourceId) : undefined;

  return (
    <GlassPageShell fill>
      <GlassPageHeader title="Email" subtitle="Campagnes prêtes, ou composez la vôtre." />

      <GlassThreeColumns className="lg:min-h-0 lg:flex-1">
        <GlassColumnPanel label={`File d'attente (${queue.length})`}>
          {queue.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/50">File vide.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {queue.map((e) => (
                <MailQueueCard key={e.id} campagne={e} active={sourceId === e.id} onClick={() => charger(e)} />
              ))}
            </div>
          )}
        </GlassColumnPanel>

        <GlassColumnPanel bare>
          {!edited ? (
            <GlassEmptyState
              icon={FileText}
              title="Aucun email sélectionné"
              description="Choisissez une campagne dans la file."
            />
          ) : (
            <div className="w-full max-w-md">
              <InboxPreview objet={edited.objet} corps={edited.corps} />
            </div>
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

              <MailEditPanel edited={edited} onChange={setEdited} onChangerSegment={changerSegment} />

              <div className="flex flex-wrap gap-2 border-t border-white/15 pt-5">
                <Button
                  className="rounded-lg bg-gold text-white hover:bg-gold/90"
                  onClick={() => terminer(`Envoyé à ${edited.nombreDestinataires} clients`)}
                >
                  <Send className="size-4" />
                  Envoyer aux {edited.nombreDestinataires} clients
                </Button>
                <Button
                  variant="outline"
                  className="rounded-lg border-white/25 bg-transparent text-white hover:bg-white/10"
                  onClick={() => (gmailConnecte ? toast.success("Test envoyé à votre adresse") : ouvrirConnexions())}
                >
                  <TestTube2 className="size-4" />
                  M&apos;envoyer un test
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
