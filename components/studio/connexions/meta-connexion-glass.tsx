"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { QrCode, AlertTriangle, Check, Loader2 } from "lucide-react";
import { GlassPanel } from "@/components/glass/glass-panel";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { InstagramBadge, FacebookBadge } from "@/components/studio/brand-icons";
import { MetaQrModal } from "@/components/parametres/meta-qr-modal";
import { useMetaConnection } from "@/lib/meta-connection-context";
import { domaineProfile } from "@/lib/mock-data";

const messagesErreur: Record<string, { titre: string; description: string }> = {
  oauth_denied: {
    titre: "Connexion annulée",
    description: "L'autorisation a été refusée ou interrompue. Vous pouvez réessayer à tout moment.",
  },
  no_page: {
    titre: "Aucune Page Facebook trouvée",
    description: "Votre compte Meta doit gérer au moins une Page Facebook pour publier depuis le Studio.",
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

function dateDuJour() {
  return new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// Reprend le flux OAuth (réel ou simulé) déjà géré par
// app/api/auth/meta/*, mais lit les paramètres de retour ici pour ne
// jamais faire quitter le Studio vers Paramètres — la connexion se fait
// entièrement depuis Studio IA.
export function MetaConnexionGlass() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { connecte, info, connecter, deconnecter } = useMetaConnection();
  const [qrOuvert, setQrOuvert] = useState(false);
  const [connexionEnCours, setConnexionEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | undefined>(undefined);

  useEffect(() => {
    const simulate = searchParams.get("meta_simulate");
    const connected = searchParams.get("meta_connected");
    const erreurParam = searchParams.get("meta_error");

    if (simulate) {
      setConnexionEnCours(true);
      const delai = setTimeout(() => {
        connecter({
          demo: true,
          instagramUsername: domaineProfile.instagramHandle,
          instagramInitiales: domaineProfile.initiales,
          facebookPageName: domaineProfile.facebookHandle,
          dateConnexion: dateDuJour(),
        });
        setConnexionEnCours(false);
        router.replace(window.location.pathname);
      }, 1500);
      return () => clearTimeout(delai);
    }

    if (connected) {
      const igUsername = searchParams.get("ig_username") ?? "";
      connecter({
        demo: false,
        instagramUsername: igUsername,
        instagramInitiales: igUsername.slice(0, 2).toUpperCase() || "??",
        facebookPageName: searchParams.get("page_name") ?? "",
        dateConnexion: dateDuJour(),
      });
      router.replace(window.location.pathname);
      return;
    }

    if (erreurParam) {
      setErreur(erreurParam);
      router.replace(window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (connexionEnCours) {
    return (
      <GlassPanel intensity="light" className="p-6">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <Loader2 className="size-6 animate-spin text-gold" />
          <p className="font-medium text-white">Connexion en cours…</p>
          <p className="text-sm text-white/60">Vérification de votre compte Instagram Business.</p>
        </div>
      </GlassPanel>
    );
  }

  if (connecte && info) {
    return (
      <GlassPanel intensity="light" className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <InstagramBadge className="size-7" />
          <FacebookBadge className="size-7" />
        </div>
        <div>
          <p className="text-base font-semibold text-white">Instagram & Facebook</p>
          <p className="text-sm text-white/60">Connecté — publication directe active depuis le Studio</p>
        </div>
        {info.demo && (
          <p className="flex items-center gap-1.5 rounded-lg bg-gold/15 px-3 py-2 text-xs font-medium text-gold">
            <AlertTriangle className="size-3.5" />
            Compte de démonstration — branchez vos vraies clés Meta pour une connexion réelle
          </p>
        )}
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-white/10 text-white">{info.instagramInitiales}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-white">@{info.instagramUsername}</p>
            <p className="text-xs text-white/55">Compte Instagram Business</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/85">
          <Check className="size-4 text-gold" />
          Page Facebook liée : <span className="font-medium">{info.facebookPageName}</span>
        </div>
        <p className="text-xs text-white/50">Connecté le {info.dateConnexion}</p>
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
        <div className="flex items-center gap-2">
          <InstagramBadge className="size-7" />
          <FacebookBadge className="size-7" />
        </div>
        <Badge variant="outline" className="border-white/20 text-white/70">
          Non connecté
        </Badge>
      </div>
      <div>
        <p className="text-base font-semibold text-white">Instagram & Facebook</p>
        <p className="text-sm text-white/60">
          Connectez vos comptes pour publier directement depuis le Studio, sans repasser par les
          apps Meta.
        </p>
      </div>

      {erreurInfo && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
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
          className="bg-gold text-white hover:bg-gold/90"
          nativeButton={false}
          render={
            <a href={`/api/auth/meta/start?retour=${encodeURIComponent(pathname)}`}>
              Connecter Instagram & Facebook
            </a>
          }
        />
        <Button
          variant="outline"
          className="border-white/20 bg-transparent text-white hover:bg-white/10"
          onClick={() => setQrOuvert(true)}
        >
          <QrCode className="size-4" />
          Scanner depuis votre téléphone
        </Button>
      </div>

      <MetaQrModal open={qrOuvert} onClose={() => setQrOuvert(false)} />
    </GlassPanel>
  );
}
