"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AlertTriangle, Check } from "lucide-react";
import { SiGmail } from "react-icons/si";
import { GlassPanel } from "@/components/glass/glass-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGmailConnection } from "@/lib/gmail-connection-context";

const messagesErreur: Record<string, { titre: string; description: string }> = {
  not_configured: {
    titre: "Google pas encore configuré",
    description: "Les identifiants OAuth Google ne sont pas encore renseignés côté serveur.",
  },
  refused: {
    titre: "Connexion annulée",
    description: "L'autorisation a été refusée. Vous pouvez réessayer à tout moment.",
  },
  no_refresh_token: {
    titre: "Autorisation incomplète",
    description: "Google n'a pas renvoyé de jeton durable. Déconnectez cette app dans votre compte Google puis réessayez.",
  },
  unknown: {
    titre: "Connexion impossible",
    description: "Une erreur inattendue est survenue pendant la connexion. Réessayez dans un instant.",
  },
};

// Connexion Gmail réelle (OAuth2, scope gmail.send) — le bouton "Connecter"
// est un vrai lien vers /api/auth/google/start, pas une simulation.
export function GmailConnexionGlass() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { connecte, info, deconnecter, rafraichir } = useGmailConnection();
  const [erreur, setErreur] = useState<string | undefined>(undefined);

  useEffect(() => {
    const connecteParam = searchParams.get("google_connected");
    const erreurParam = searchParams.get("google_error");

    if (connecteParam) {
      rafraichir();
      router.replace(pathname);
      return;
    }
    if (erreurParam) {
      setErreur(erreurParam);
      router.replace(pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (connecte && info) {
    return (
      <GlassPanel intensity="light" className="flex flex-col gap-3 p-6">
        <span className="flex size-7 items-center justify-center rounded-lg bg-white">
          <SiGmail className="size-4 text-[#EA4335]" />
        </span>
        <div>
          <p className="text-base font-semibold text-white">Gmail</p>
          <p className="text-sm text-white/60">Connecté — envoi direct actif depuis le Studio</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/85">
          <Check className="size-4 text-gold" />
          {info.email}
        </div>
        <p className="text-xs text-white/50">Connecté le {info.connecteLe}</p>
        <Button
          variant="outline"
          className="self-start border-white/20 bg-transparent text-white hover:bg-white/10"
          onClick={deconnecter}
        >
          Déconnecter
        </Button>
      </GlassPanel>
    );
  }

  const erreurInfo = erreur ? messagesErreur[erreur] ?? messagesErreur.unknown : null;

  return (
    <GlassPanel intensity="light" className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <span className="flex size-7 items-center justify-center rounded-lg bg-white">
          <SiGmail className="size-4 text-[#EA4335]" />
        </span>
        <Badge variant="outline" className="border-white/20 text-white/70">
          Non connecté
        </Badge>
      </div>
      <div>
        <p className="text-base font-semibold text-white">Gmail</p>
        <p className="text-sm text-white/60">
          Connectez votre compte Gmail pour envoyer vos campagnes directement depuis le Studio
          (autorisation d&apos;envoi uniquement, jamais de lecture de vos messages).
        </p>
      </div>

      {erreurInfo && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">{erreurInfo.titre}</p>
            <p className="mt-0.5 text-destructive/90">{erreurInfo.description}</p>
          </div>
        </div>
      )}

      <Button
        className="self-start bg-gold text-white hover:bg-gold/90"
        nativeButton={false}
        render={<a href={`/api/auth/google/start?retour=${encodeURIComponent(pathname)}`}>Connecter Gmail</a>}
      />
    </GlassPanel>
  );
}
