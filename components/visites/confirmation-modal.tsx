"use client";

import { Modal } from "@/components/ui/modal";
import { domaineProfile, type Visite } from "@/lib/mock-data";
import { genererMessageConfirmation } from "@/lib/visites";

function SmsRendu({ texte }: { texte: string }) {
  return (
    <div className="mx-auto max-w-xs rounded-3xl border border-border/70 bg-background p-4">
      <p className="mb-3 text-center text-xs text-stone">SMS envoyé au visiteur</p>
      <div className="rounded-2xl rounded-bl-sm bg-vine px-4 py-3 text-sm text-white">
        {texte}
      </div>
    </div>
  );
}

function EmailRendu({ texte, visite }: { texte: string; visite: Visite }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/70">
      <div className="space-y-1 border-b border-border/60 bg-muted/40 px-4 py-3 text-xs text-stone">
        <p>
          <span className="font-medium text-ink">De :</span> {domaineProfile.nomDomaine}
        </p>
        <p>
          <span className="font-medium text-ink">À :</span> {visite.client}
        </p>
        <p>
          <span className="font-medium text-ink">Objet :</span> Confirmation de votre visite
        </p>
      </div>
      <div className="px-4 py-4 text-sm leading-relaxed text-ink">{texte}</div>
    </div>
  );
}

export function ConfirmationModal({
  visite,
  onClose,
}: {
  visite: Visite | null;
  onClose: () => void;
}) {
  const message = visite ? genererMessageConfirmation(visite, domaineProfile.nomDomaine) : null;

  return (
    <Modal
      open={!!visite}
      onClose={onClose}
      title="Confirmation envoyée au visiteur"
      maxWidthClassName="max-w-md"
    >
      {visite && message && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-stone">
            Message exact transmis à <span className="text-ink">{visite.client}</span> lors de la
            confirmation de la visite du {visite.date} à {visite.heure}.
          </p>
          {message.canal === "sms" ? (
            <SmsRendu texte={message.texte} />
          ) : (
            <EmailRendu texte={message.texte} visite={visite} />
          )}
        </div>
      )}
    </Modal>
  );
}
