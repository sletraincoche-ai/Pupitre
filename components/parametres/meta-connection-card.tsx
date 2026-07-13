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
import { FacebookBadge } from "@/components/studio/brand-icons";
import { MetaQrModal } from "@/components/parametres/meta-qr-modal";
import { useMetaConnection } from "@/lib/meta-connection-context";

const messagesErreur: Record<string, { titre: string; description: string }> = {
  not_configured: {
    titre: "Meta pas encore configuré",
    description: "Les identifiants OAuth Meta ne sont pas encore renseignés côté serveur.",
  },
  refused: {
    titre: "Connexion annulée",
    description: "L'autorisation a été refusée ou interrompue. Vous pouvez réessayer à tout moment.",
  },
  no_page: {
    titre: "Aucune Page Facebook trouvée",
    description: "Votre compte Meta doit gérer au moins une Page Facebook pour publier depuis le Studio.",
  },
  unknown: {
    titre: "Connexion impossible",
    description: "Une erreur inattendue est survenue pendant la connexion. Réessayez dans un instant.",
  },
};

export function MetaConnectionCard({ erreur }: { erreur?: string }) {
  const { connecte, choixPageRequis, info, deconnecter } = useMetaConnection();
  const [qrOuvert, setQrOuvert] = useState(false);

  if (choixPageRequis) {
    return (
      <Card className="border border-border/70 bg-card shadow-none">
        <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <Loader2 className="size-6 text-vine" />
          <p className="font-medium text-ink">Choisissez votre Page Facebook</p>
          <p className="text-sm text-stone">Plusieurs Pages disponibles — la sélection se fait depuis Studio IA &gt; Connexions.</p>
        </CardContent>
      </Card>
    );
  }

  if (connecte && info) {
    return (
      <Card className="border border-border/70 bg-card shadow-none">
        <CardHeader className="px-6">
          <div className="flex items-center gap-2">
            <FacebookBadge className="size-7" />
          </div>
          <CardTitle>Facebook</CardTitle>
          <CardDescription>Connecté — publication directe active depuis le Studio</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-6">
          <div className="flex items-center gap-2 text-sm text-ink">
            <Check className="size-4 text-vine" />
            Page Facebook liée : <span className="font-medium">{info.pageName}</span>
          </div>
          <p className="text-xs text-stone">Connecté le {info.connecteLe}</p>
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
          <FacebookBadge className="size-7" />
        </div>
        <CardTitle>Facebook</CardTitle>
        <CardDescription>
          Connectez votre Page pour publier directement depuis le Studio, sans repasser par les
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
            render={<a href="/api/auth/meta/start">Connecter Facebook</a>}
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
