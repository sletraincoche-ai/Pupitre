// Intégration Gmail (OAuth2) — utilisé uniquement côté serveur (routes
// API). Ne jamais importer ce fichier depuis un composant client :
// GOOGLE_CLIENT_SECRET et les tokens ne doivent jamais atteindre le
// bundle navigateur.
import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";

// gmail.send uniquement — jamais de scope de lecture (principe du
// moindre privilège demandé). userinfo.email/openid servent seulement à
// afficher quelle adresse Google est connectée, pas à lire des messages.
export const GOOGLE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
];

export function isGoogleConfigured(): boolean {
  return !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
}

export function buildGoogleAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_OAUTH_SCOPES.join(" "),
    access_type: "offline",
    // Force le renvoi d'un refresh_token même si ce compte Google a déjà
    // autorisé l'app par le passé (Google ne le renvoie sinon qu'à la
    // toute première autorisation).
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

type TokensReponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
};

export async function echangerCodeContreTokens(code: string, redirectUri: string): Promise<TokensReponse> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description ?? data.error ?? "Échange de code Google échoué");
  }
  return data;
}

export async function rafraichirAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    // invalid_grant == refresh token révoqué/expiré côté Google (l'utilisateur
    // a retiré l'accès, ou changé son mot de passe) — l'appelant doit
    // distinguer ce cas pour proposer une reconnexion.
    const erreur = new Error(data.error_description ?? data.error ?? "Rafraîchissement du token Google échoué");
    (erreur as Error & { code?: string }).code = data.error;
    throw erreur;
  }
  return data;
}

export async function recupererEmailGoogle(accessToken: string): Promise<string> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Impossible de récupérer l'adresse Google");
  const data = await res.json();
  return data.email as string;
}

function encoderBase64Url(valeur: string): string {
  return Buffer.from(valeur, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Encode l'en-tête "From/To/Subject" au format MIME =?UTF-8?B?...?= pour
// que les accents (é, à, …) s'affichent correctement chez le destinataire.
function encoderEnTeteMime(valeur: string): string {
  return `=?UTF-8?B?${Buffer.from(valeur, "utf-8").toString("base64")}?=`;
}

export async function envoyerEmailGmail({
  accessToken,
  from,
  to,
  subject,
  corpsHtml,
}: {
  accessToken: string;
  from: string;
  to: string;
  subject: string;
  corpsHtml: string;
}): Promise<void> {
  const message = [
    `From: ${encoderEnTeteMime(from)} <${from}>`,
    `To: ${to}`,
    `Subject: ${encoderEnTeteMime(subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "",
    corpsHtml,
  ].join("\r\n");

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ raw: encoderBase64Url(message) }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const erreur = new Error(data.error?.message ?? "Échec de l'envoi via Gmail");
    (erreur as Error & { status?: number }).status = res.status;
    throw erreur;
  }
}

export class GmailNonConnecteError extends Error {
  constructor() {
    super("Aucun compte Gmail connecté.");
  }
}

export class GmailRevoqueError extends Error {
  constructor() {
    super("La connexion Gmail a été révoquée ou a expiré. Reconnectez votre compte.");
  }
}

// Renvoie un access_token valide pour ce compte Pupitre, en le
// rafraîchissant via le refresh_token stocké si besoin. Supprime la
// connexion et lève GmailRevoqueError si Google refuse le rafraîchissement
// (accès retiré par l'utilisateur, mot de passe Google changé, etc.).
export async function obtenirAccessTokenValide(userId: string): Promise<{ accessToken: string; email: string }> {
  const { data } = await supabaseAdmin
    .from("gmail_connections")
    .select("google_email, refresh_token, access_token, access_token_expires_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) throw new GmailNonConnecteError();

  const expireBientot =
    !data.access_token_expires_at || new Date(data.access_token_expires_at).getTime() - Date.now() < 60_000;

  if (data.access_token && !expireBientot) {
    return { accessToken: data.access_token, email: data.google_email };
  }

  try {
    const tokens = await rafraichirAccessToken(data.refresh_token);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    await supabaseAdmin
      .from("gmail_connections")
      .update({ access_token: tokens.access_token, access_token_expires_at: expiresAt, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    return { accessToken: tokens.access_token, email: data.google_email };
  } catch (erreur) {
    if ((erreur as Error & { code?: string }).code === "invalid_grant") {
      await supabaseAdmin.from("gmail_connections").delete().eq("user_id", userId);
      throw new GmailRevoqueError();
    }
    throw erreur;
  }
}
