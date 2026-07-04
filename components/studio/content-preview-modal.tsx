"use client";

import { Heart, MessageCircle, Send, Bookmark, Star } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { EmailInboxRendu, SmsBubbleRendu } from "@/components/ui/message-renders";
import { domaineProfile, type ContenuStudio } from "@/lib/mock-data";

function InstagramRendu({ texte }: { texte: string }) {
  return (
    <div className="mx-auto max-w-xs overflow-hidden rounded-xl border border-border/70 bg-background">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="flex size-7 items-center justify-center rounded-full bg-gold text-xs font-medium text-white">
          {domaineProfile.initiales}
        </span>
        <span className="text-sm font-medium text-ink">
          {domaineProfile.nomDomaine.toLowerCase().replace(/\s+/g, "")}
        </span>
      </div>
      <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-vine to-gold/60 text-white/70">
        <Star className="size-10" strokeWidth={1} />
      </div>
      <div className="flex items-center gap-3 px-3 pt-2.5">
        <Heart className="size-5 text-ink" />
        <MessageCircle className="size-5 text-ink" />
        <Send className="size-5 text-ink" />
        <Bookmark className="ml-auto size-5 text-ink" />
      </div>
      <p className="px-3 pt-1.5 text-xs font-medium text-ink">142 mentions J&apos;aime</p>
      <p className="px-3 pb-3 pt-1 text-sm text-ink">
        <span className="font-medium">
          {domaineProfile.nomDomaine.toLowerCase().replace(/\s+/g, "")}
        </span>{" "}
        {texte}
      </p>
    </div>
  );
}

function AvisGoogleRendu({ contexte, texte }: { contexte?: string; texte: string }) {
  const [etoiles, ...reste] = (contexte ?? "").split(" ");
  const avis = reste.join(" ");

  return (
    <div className="rounded-lg border border-border/70 bg-background p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-ink">
          {avis.match(/^\S+/)?.[0]?.[0] ?? "?"}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{avis.split(" — ")[0]}</p>
          <p className="text-gold">{etoiles}</p>
          <p className="mt-1 text-sm text-stone">{avis.split(" — ")[1]?.replace(/"/g, "")}</p>
        </div>
      </div>
      <div className="mt-4 ml-12 rounded-lg bg-muted/50 p-3">
        <p className="text-xs font-medium text-ink">Réponse du propriétaire</p>
        <p className="mt-1 text-sm text-stone">{texte}</p>
      </div>
    </div>
  );
}

export function ContentPreviewModal({
  contenu,
  onClose,
}: {
  contenu: ContenuStudio | null;
  onClose: () => void;
}) {
  return (
    <Modal
      open={!!contenu}
      onClose={onClose}
      title="Rendu réel"
      maxWidthClassName="max-w-md"
    >
      {contenu && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-stone">{contenu.declencheur}</p>
          {contenu.plateforme === "Instagram" && <InstagramRendu texte={contenu.texte} />}
          {contenu.plateforme === "Email" && (
            <EmailInboxRendu
              texte={contenu.texte}
              de={domaineProfile.nomDomaine}
              a={contenu.destinataire ?? "Destinataire"}
              objet="Une nouvelle de notre domaine"
            />
          )}
          {contenu.plateforme === "SMS" && (
            <SmsBubbleRendu
              texte={contenu.texte}
              label={`SMS envoyé à ${contenu.destinataire ?? "votre visiteur"}`}
            />
          )}
          {contenu.plateforme === "Avis Google" && (
            <AvisGoogleRendu contexte={contenu.contexte} texte={contenu.texte} />
          )}
        </div>
      )}
    </Modal>
  );
}
