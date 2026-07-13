"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { QrCode, AlertTriangle, Check, Loader2 } from "lucide-react";
import { GlassPanel } from "@/components/glass/glass-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FacebookBadge, InstagramBadge } from "@/components/studio/brand-icons";
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

type PageFacebookOption = { id: string; name: string };

// Connexion Facebook réelle (OAuth2 Facebook Login) — le bouton
// "Connecter" est un vrai lien vers /api/auth/meta/start. Si le compte
// gère plusieurs Pages, un sélecteur s'affiche pour choisir laquelle
// utiliser (voir /api/studio/meta/pages) avant que la publication ne
// soit débloquée.
export function MetaConnexionGlass() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { connecte, choixPageRequis, info, instagram, deconnecter, rafraichir } = useMetaConnection();
  const [qrOuvert, setQrOuvert] = useState(false);
  const [erreur, setErreur] = useState<string | undefined>(undefined);
  const [pages, setPages] = useState<PageFacebookOption[] | null>(null);
  const [selectionEnCours, setSelectionEnCours] = useState<string | null>(null);

  useEffect(() => {
    const connecteParam = searchParams.get("meta_connected");
    const erreurParam = searchParams.get("meta_error");

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

  useEffect(() => {
    if (!choixPageRequis) {
      setPages(null);
      return;
    }
    fetch("/api/studio/meta/pages")
      .then((r) => r.json())
      .then((data) => setPages(data.pages ?? []))
      .catch(() => setPages([]));
  }, [choixPageRequis]);

  async function choisirPage(pageId: string) {
    setSelectionEnCours(pageId);
    try {
      const res = await fetch("/api/studio/meta/pages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      if (res.ok) await rafraichir();
    } finally {
      setSelectionEnCours(null);
    }
  }

  if (choixPageRequis) {
    return (
      <GlassPanel intensity="light" className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <FacebookBadge className="size-7" />
        </div>
        <div>
          <p className="text-base font-semibold text-white">Choisissez votre Page Facebook</p>
          <p className="text-sm text-white/60">
            Votre compte gère plusieurs Pages — sélectionnez celle à utiliser pour publier depuis
            le Studio.
          </p>
        </div>
        {pages === null ? (
          <p className="text-sm text-white/50">Chargement des Pages…</p>
        ) : pages.length === 0 ? (
          <p className="text-sm text-white/50">Aucune Page trouvée.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => choisirPage(page.id)}
                disabled={selectionEnCours !== null}
                className="flex items-center justify-between rounded-lg border border-white/20 px-3 py-2.5 text-left text-sm text-white transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                {page.name}
                {selectionEnCours === page.id && <Loader2 className="size-4 animate-spin" />}
              </button>
            ))}
          </div>
        )}
      </GlassPanel>
    );
  }

  if (connecte && info) {
    return (
      <GlassPanel intensity="light" className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <FacebookBadge className="size-7" />
        </div>
        <div>
          <p className="text-base font-semibold text-white">Facebook</p>
          <p className="text-sm text-white/60">Connecté — publication directe active depuis le Studio</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/85">
          <Check className="size-4 text-gold" />
          Page Facebook liée : <span className="font-medium">{info.pageName}</span>
        </div>
        <p className="text-xs text-white/50">Connecté le {info.connecteLe}</p>

        <div className="flex flex-col gap-2 rounded-lg border border-white/15 p-3">
          <div className="flex items-center gap-2">
            <InstagramBadge className="size-6" />
            <p className="text-sm font-semibold text-white">Instagram</p>
          </div>
          {instagram.connecte ? (
            <div className="flex items-center gap-2 text-sm text-white/85">
              <Check className="size-4 text-gold" />
              Connecté — @{instagram.username}
            </div>
          ) : instagram.permissionManquante ? (
            <>
              <p className="text-sm text-white/60">
                Compte Instagram Business @{instagram.username} détecté, mais la publication n&apos;est
                pas encore autorisée.
              </p>
              <Button
                className="self-start bg-gold text-white hover:bg-gold/90"
                nativeButton={false}
                render={
                  <a href={`/api/auth/meta/start?retour=${encodeURIComponent(pathname)}`}>
                    Autoriser la publication Instagram
                  </a>
                }
              />
            </>
          ) : (
            <p className="text-sm text-white/60">
              Aucun compte Instagram Business lié à cette Page Facebook.
            </p>
          )}
        </div>

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
          <FacebookBadge className="size-7" />
        </div>
        <Badge variant="outline" className="border-white/20 text-white/70">
          Non connecté
        </Badge>
      </div>
      <div>
        <p className="text-base font-semibold text-white">Facebook</p>
        <p className="text-sm text-white/60">
          Connectez votre Page Facebook pour publier directement depuis le Studio, sans repasser
          par les apps Meta.
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

      <div className="flex flex-wrap items-center gap-2">
        <Button
          className="bg-gold text-white hover:bg-gold/90"
          nativeButton={false}
          render={<a href={`/api/auth/meta/start?retour=${encodeURIComponent(pathname)}`}>Connecter Facebook</a>}
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
