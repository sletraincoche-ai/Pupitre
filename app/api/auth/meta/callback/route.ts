import { NextRequest, NextResponse } from "next/server";
import {
  echangerCodeContreTokenCourt,
  echangerTokenLongueDuree,
  recupererUtilisateurFacebook,
  recupererCompteInstagramLie,
  listerPermissionsAccordees,
  listerPagesFacebookAvecRepli,
} from "@/lib/meta";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

function sanitizeRetour(valeur: string | null): string {
  if (valeur && valeur.startsWith("/dashboard/")) return valeur;
  return "/dashboard/studio";
}

function lireRetourDepuisState(state: string | null): string {
  if (!state) return "/dashboard/studio";
  try {
    const decode: unknown = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
    if (decode && typeof decode === "object" && "retour" in decode) {
      return sanitizeRetour(String((decode as { retour: unknown }).retour));
    }
  } catch {
    // state invalide ou altéré — retombe sur la page par défaut.
  }
  return "/dashboard/studio";
}

// Réception du retour OAuth Meta. Échange le code contre un token
// utilisateur longue durée, liste les Pages administrées, et stocke tout
// côté serveur dans meta_connections (jamais dans l'URL). Si le compte
// gère plusieurs Pages, page_id/page_name/page_access_token restent nuls
// tant que l'utilisateur n'a pas choisi laquelle utiliser (voir
// /api/studio/meta/pages) ; le client le détecte via /api/studio/meta.
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  const erreurMeta = request.nextUrl.searchParams.get("error");
  const retour = lireRetourDepuisState(request.nextUrl.searchParams.get("state"));

  if (erreurMeta || !code) {
    const raison = erreurMeta === "access_denied" ? "refused" : "unknown";
    return NextResponse.redirect(`${origin}${retour}?meta_error=${raison}`);
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/dashboard/studio`);
  }

  try {
    const tokenCourt = await echangerCodeContreTokenCourt(code);
    const tokenLong = await echangerTokenLongueDuree(tokenCourt.access_token);
    const utilisateurFb = await recupererUtilisateurFacebook(tokenLong.access_token);

    // listerPagesFacebookAvecRepli essaie /me/accounts puis, s'il renvoie
    // [], se rabat sur les ids de Pages lus dans granular_scopes via
    // /debug_token — voir lib/meta.ts pour le détail du bug contourné.
    const pages = await listerPagesFacebookAvecRepli(tokenLong.access_token);

    const permissions = await listerPermissionsAccordees(tokenLong.access_token).catch((e) => {
      console.error("Échec de la lecture des permissions accordées :", e);
      return [];
    });
    console.log("[meta/callback] diagnostic — utilisateur:", utilisateurFb.id, utilisateurFb.name);
    console.log("[meta/callback] diagnostic — permissions accordées:", JSON.stringify(permissions));
    console.log(
      "[meta/callback] diagnostic — pages résolues (via /me/accounts ou repli granular_scopes):",
      JSON.stringify(pages.map((p) => ({ id: p.id, name: p.name })))
    );

    if (pages.length === 0) {
      return NextResponse.redirect(`${origin}${retour}?meta_error=no_page`);
    }

    const pageUnique = pages.length === 1 ? pages[0] : null;

    // La permission de publication Instagram est propre au token
    // utilisateur (pas à une Page précise) — déjà lue ci-dessus via
    // listerPermissionsAccordees(), réutilisée ici pour éviter un second
    // appel /me/permissions.
    const publishAutorise = permissions.some((p) => p.permission === "instagram_content_publish" && p.status === "granted");
    const instagram = pageUnique
      ? await recupererCompteInstagramLie(pageUnique.id, pageUnique.access_token).catch((e) => {
          console.error("Échec de la résolution du compte Instagram lié à la Page :", e);
          return null;
        })
      : null;

    const { error } = await supabaseAdmin.from("meta_connections").upsert({
      user_id: user.id,
      user_access_token: tokenLong.access_token,
      facebook_user_id: utilisateurFb.id,
      facebook_user_name: utilisateurFb.name,
      page_id: pageUnique?.id ?? null,
      page_name: pageUnique?.name ?? null,
      page_access_token: pageUnique?.access_token ?? null,
      instagram_business_id: instagram?.id ?? null,
      instagram_username: instagram?.username ?? null,
      instagram_publish_autorise: publishAutorise,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);

    return NextResponse.redirect(`${origin}${retour}?meta_connected=1`);
  } catch (erreur) {
    console.error("Échec de la connexion Meta :", erreur);
    return NextResponse.redirect(`${origin}${retour}?meta_error=unknown`);
  }
}
