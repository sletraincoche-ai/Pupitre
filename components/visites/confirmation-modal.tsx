"use client";

import { Modal } from "@/components/ui/modal";
import { EmailInboxRendu, SmsBubbleRendu } from "@/components/ui/message-renders";
import { domaineProfile, type Visite } from "@/lib/mock-data";
import { genererMessageConfirmation } from "@/lib/visites";

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
            <SmsBubbleRendu texte={message.texte} label="SMS envoyé au visiteur" />
          ) : (
            <EmailInboxRendu
              texte={message.texte}
              de={domaineProfile.nomDomaine}
              a={visite.client}
              objet="Confirmation de votre visite"
            />
          )}
        </div>
      )}
    </Modal>
  );
}
