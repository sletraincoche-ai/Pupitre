"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Plus, Send, TestTube2, FileText } from "lucide-react";
import { InboxPreview } from "@/components/studio/mail/inbox-preview";
import { MailQueueCard } from "@/components/studio/mail/mail-queue-card";
import {
  MailEditPanel,
  segmentsDisponibles,
  type EmailEdite,
} from "@/components/studio/mail/mail-edit-panel";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { useClients } from "@/lib/clients-context";
import { getNumeroParId, formatOrigine } from "@/lib/fiches";
import { emailCampagnes as emailCampagnesInitiales, type EmailCampagne } from "@/lib/mock-data";

function versEmailEdite(e: EmailCampagne): EmailEdite {
  return { objet: e.objet, corps: e.corps, segment: e.segment, nombreDestinataires: e.nombreDestinataires };
}

export default function MailPage() {
  const { clients } = useClients();
  const [queue, setQueue] = useState(emailCampagnesInitiales);
  const [sourceId, setSourceId] = useState<string | null>(queue[0]?.id ?? null);
  const [edited, setEdited] = useState<EmailEdite | null>(queue[0] ? versEmailEdite(queue[0]) : null);

  function charger(campagne: EmailCampagne) {
    setSourceId(campagne.id);
    setEdited(versEmailEdite(campagne));
  }

  function creerManuellement() {
    setSourceId(null);
    setEdited({ objet: "", corps: "", segment: "Tous les clients", nombreDestinataires: clients.length });
  }

  function terminer(message: string) {
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
    <div className="flex flex-col gap-6">
      <Link href="/dashboard/studio" className="flex w-fit items-center gap-1.5 text-sm text-stone hover:text-vine">
        <ArrowLeft className="size-4" />
        Retour au Studio
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl text-ink">Atelier e-mail</h1>
          <p className="mt-1 text-stone">Campagnes prêtes, ou composez la vôtre.</p>
        </div>
        <Button variant="outline" className="rounded-[3px]" onClick={creerManuellement}>
          <Plus className="size-4" />
          Créer un email
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium tracking-wide text-stone uppercase">
            File d&apos;attente ({queue.length})
          </p>
          {queue.length === 0 ? (
            <p className="border border-dashed border-border py-8 text-center text-sm text-stone">
              File vide. Créez un email.
            </p>
          ) : (
            <div className="divide-y divide-border border border-border">
              {queue.map((e) => (
                <MailQueueCard key={e.id} campagne={e} active={sourceId === e.id} onClick={() => charger(e)} />
              ))}
            </div>
          )}
        </div>

        <div>
          {!edited ? (
            <EmptyState
              icon={Plus}
              title="Aucun email sélectionné"
              description="Choisissez une campagne dans la file ou composez un email de zéro."
            />
          ) : (
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_340px]">
              <div>
                <InboxPreview objet={edited.objet} corps={edited.corps} />
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

                <MailEditPanel edited={edited} onChange={setEdited} onChangerSegment={changerSegment} />

                <div className="flex flex-wrap gap-2 border-t border-border pt-5">
                  <Button
                    className="rounded-[3px] bg-vine text-white hover:bg-vine/90"
                    onClick={() => terminer(`Envoyé à ${edited.nombreDestinataires} clients`)}
                  >
                    <Send className="size-4" />
                    Envoyer aux {edited.nombreDestinataires} clients
                  </Button>
                  <Button variant="outline" className="rounded-[3px]" onClick={() => toast.success("Test envoyé à votre adresse")}>
                    <TestTube2 className="size-4" />
                    M&apos;envoyer un test
                  </Button>
                  <Button variant="ghost" className="rounded-[3px]" onClick={() => toast.success("Brouillon enregistré")}>
                    <FileText className="size-4" />
                    Enregistrer brouillon
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
