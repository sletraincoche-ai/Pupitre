"use client";

import { useState } from "react";
import { QrCode, AlertTriangle, Check, Loader2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { InstagramBadge, FacebookBadge } from "@/components/studio/brand-icons";
import { MetaQrModal } from "@/components/parametres/meta-qr-modal";
import { useMetaConnection } from "@/lib/meta-connection-context";

const messagesErreur: Record<string, { titre: string; description: string }> = {
  oauth_denied: {
    titre: "Connexion annulée",
    description: "L'autorisation a été refusée ou interrompue. Vous pouvez réessayer à tout moment.",
  },
  no_page: {
    titre: "Aucune Page Facebook trouvée",
    description:
      "Votre compte Meta doit gérer au moins une Page Facebook pour publier depuis le Studio.",
  },
  no_business_account: {
    titre: "Compte Instagram non Business",
    description:
      "Votre compte Instagram doit être un compte Professionnel (Business) lié à votre Page Facebook, et non un compte personnel.",
  },
  unknown: {
    titre: "Connexion impossible",
    description: "Une erreur inattendue est survenue pendant la connexion. Réessayez dans un instant.",
  },
};

export function MetaConnectionCard({
  erreur,
  connexionEnCours,
}: {
  erreur?: string;
  connexionEnCours?: boolean;
}) {
  const { connecte, info, deconnecter } = useMetaConnection();
  const [qrOuvert, setQrOuvert] = useState(false);

  if (connexionEnCours) {
    return (
      <Card className="border border-border/70 bg-card shadow-none">
        <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <Loader2 className="size-6 animate-spin text-vine" />
          <p className="font-medium text-ink">Connexion en cours…</p>
          <p className="text-sm text-stone">Vérification de votre compte Instagram Business.</p>
        </CardContent>
      </Card>
    );
  }

  if (connecte && info) {
    return (
      <Card className="border border-border/70 bg-card shadow-none">
        <CardHeader className="px-6">
          <div className="flex items-center gap-2">
            <InstagramBadge className="size-7" />
            <FacebookBadge className="size-7" />
          </div>
          <CardTitle>Instagram & Facebook</CardTitle>
          <CardDescription>Connecté — publication directe active depuis le Studio</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-6">
          {info.demo && (
            <p className="flex items-center gap-1.5 rounded-lg bg-gold/10 px-3 py-2 text-xs font-medium text-gold">
              <AlertTriangle className="size-3.5" />
              Compte de démonstration — branchez vos vraies clés Meta pour une connexion réelle
            </p>
          )}
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-vine/10 text-vine">
                {info.instagramInitiales}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-ink">@{info.instagramUsername}</p>
              <p className="text-xs text-stone">Compte Instagram Business</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-ink">
            <Check className="size-4 text-vine" />
            Page Facebook liée : <span className="font-medium">{info.facebookPageName}</span>
          </div>
          <p className="text-xs text-stone">Connecté le {info.dateConnexion}</p>
          <Button variant="outline" className="self-start" onClick={deconnecter}>
            Déconnecter
          </Button>
        </CardContent>
      </Card>
    );
  }

  const erreurInfo = erreur ? messagesErreur[erreur] ?? messagesErreur.unknown : null;

  return (
    <Card className="border border-border/70 bg-card shadow-none">
      <CardHeader className="px-6">
        <div className="flex items-center gap-2">
          <InstagramBadge className="size-7" />
          <FacebookBadge className="size-7" />
        </div>
        <CardTitle>Instagram & Facebook</CardTitle>
        <CardDescription>
          Connectez vos comptes pour publier directement depuis le Studio, sans repasser par les
          apps Meta.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-6">
        {erreurInfo && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">{erreurInfo.titre}</p>
              <p className="mt-0.5 text-destructive/90">{erreurInfo.description}</p>
              <a
                href="https://www.facebook.com/business/help"
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block underline"
              >
                Voir l&apos;aide Meta Business
              </a>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            className="bg-vine text-white hover:bg-vine/90"
            nativeButton={false}
            render={<a href="/api/auth/meta/start">Connecter Instagram & Facebook</a>}
          />
          <Button variant="outline" onClick={() => setQrOuvert(true)}>
            <QrCode className="size-4" />
            Scanner depuis votre téléphone
          </Button>
        </div>
      </CardContent>

      <MetaQrModal open={qrOuvert} onClose={() => setQrOuvert(false)} />
    </Card>
  );
}
