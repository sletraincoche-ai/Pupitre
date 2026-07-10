import { NextRequest, NextResponse } from "next/server";
import { echangerCodeContreTokens, recupererEmailGoogle } from "@/lib/google";
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

// Réception du retour OAuth Google. Le cookie de session Pupitre traverse
// cette redirection externe normalement (même navigateur, SameSite=Lax
// autorise une navigation top-level GET) : requireUser() y fonctionne.
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  const erreurGoogle = request.nextUrl.searchParams.get("error");
  const retour = lireRetourDepuisState(request.nextUrl.searchParams.get("state"));

  if (erreurGoogle || !code) {
    // "access_denied" = l'utilisateur a refusé le consentement.
    const code = erreurGoogle === "access_denied" ? "refused" : "unknown";
    return NextResponse.redirect(`${origin}${retour}?google_error=${code}`);
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/dashboard/studio`);
  }

  try {
    const redirectUri = `${origin}/api/auth/google/callback`;
    const tokens = await echangerCodeContreTokens(code, redirectUri);

    if (!tokens.refresh_token) {
      // Google ne renvoie un refresh_token qu'à la toute première
      // autorisation (ou avec prompt=consent, déjà forcé côté start) —
      // si absent malgré tout, impossible d'envoyer plus tard sans
      // repasser par un nouveau consentement.
      return NextResponse.redirect(`${origin}${retour}?google_error=no_refresh_token`);
    }

    const email = await recupererEmailGoogle(tokens.access_token);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const { error } = await supabaseAdmin.from("gmail_connections").upsert({
      user_id: user.id,
      google_email: email,
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
      access_token_expires_at: expiresAt,
      scope: tokens.scope,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);

    return NextResponse.redirect(`${origin}${retour}?google_connected=1`);
  } catch (erreur) {
    console.error("Échec de la connexion Gmail :", erreur);
    return NextResponse.redirect(`${origin}${retour}?google_error=unknown`);
  }
}
