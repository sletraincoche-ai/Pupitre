// Intégration Meta (Facebook + Instagram Business, lié à la même Page) —
// utilisé uniquement côté serveur (routes API). Ne jamais importer ce
// fichier depuis un composant client : META_APP_SECRET et les tokens ne
// doivent jamais atteindre le bundle navigateur.
import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";

// v19.0 a expiré le 21 mai 2026 (durée de vie Graph API ~2 ans) —
// toujours utiliser une version encore supportée.
const GRAPH_VERSION = "v23.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

// Ces permissions ne sont plus passées directement dans l'URL OAuth
// (voir buildMetaAuthUrl) : Facebook route nos demandes vers "Facebook
// Login for Business" dès qu'une permission business est demandée
// (pages_manage_posts, instagram_content_publish...), et ce flux exige
// un config_id créé dans App Dashboard > Facebook Login for Business >
// Configurations — la doc Meta est explicite : "config_id has replaced
// scope (which should not be used)". Cette liste documente ce qui est
// réellement coché dans cette Configuration (id : voir META_CONFIG_ID).
//
// instagram_basic n'y figure PAS : la documentation Meta le liste comme
// requis pour Content Publishing, mais il n'apparaît pas comme
// sélectionnable dans le sélecteur de permissions de la Configuration
// (seuls pages_show_list/pages_read_engagement/pages_manage_posts/
// instagram_content_publish/instagram_manage_comments y étaient
// proposés) — probablement parce que le produit "Instagram Graph API"
// n'est pas ajouté séparément à l'app, ou parce que ce scope doit être
// demandé/activé ailleurs avant d'apparaître ici. Non résolu : à vérifier
// empiriquement en testant la publication avec la Configuration actuelle
// (sans instagram_basic) — si Graph API renvoie une erreur de permission
// citant instagram_basic, ce sera la preuve qu'il manque réellement et
// qu'il faut creuser du côté du produit "Instagram Graph API".
export const META_OAUTH_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "instagram_content_publish",
];

export function isMetaConfigured(): boolean {
  return !!process.env.META_APP_ID && !!process.env.META_APP_SECRET && !!process.env.META_CONFIG_ID;
}

export function buildMetaAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID ?? "",
    redirect_uri: process.env.META_REDIRECT_URI ?? "",
    config_id: process.env.META_CONFIG_ID ?? "",
    response_type: "code",
    ...(state ? { state } : {}),
  });
  return `https://www.facebook.com/dialog/oauth?${params.toString()}`;
}

async function appelGraphOuErreur<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || data.error) {
    const message = data.error?.message ?? "Appel Graph API échoué";
    const erreur = new Error(message);
    (erreur as Error & { code?: number; subcode?: number }).code = data.error?.code;
    (erreur as Error & { code?: number; subcode?: number }).subcode = data.error?.error_subcode;
    throw erreur;
  }
  return data as T;
}

export async function echangerCodeContreTokenCourt(code: string): Promise<{ access_token: string }> {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    code,
  });
  return appelGraphOuErreur(`${GRAPH_BASE}/oauth/access_token?${params.toString()}`);
}

// Un token utilisateur longue durée (~60 jours) permet de relister les
// Pages plus tard sans repasser par tout le consentement OAuth ; les
// tokens de Page obtenus à partir de lui n'expirent en pratique pas tant
// que l'autorisation n'est pas révoquée.
export async function echangerTokenLongueDuree(tokenCourt: string): Promise<{ access_token: string }> {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    fb_exchange_token: tokenCourt,
  });
  return appelGraphOuErreur(`${GRAPH_BASE}/oauth/access_token?${params.toString()}`);
}

export async function recupererUtilisateurFacebook(accessToken: string): Promise<{ id: string; name: string }> {
  return appelGraphOuErreur(`${GRAPH_BASE}/me?fields=id,name&access_token=${encodeURIComponent(accessToken)}`);
}

type DonneesDebugToken = {
  data?: { granular_scopes?: { scope: string; target_ids?: string[] }[] };
};

// Interroge Graph API sur ce que CE token précis porte réellement (type,
// scopes effectifs, expiration, user_id, et surtout granular_scopes) au
// lieu de se fier à l'écran de consentement ou à /me/permissions (qui
// reflète ce qui a été accordé, pas forcément ce que porte ce token-ci).
export async function debugToken(accessToken: string): Promise<DonneesDebugToken> {
  const appToken = `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`;
  const params = new URLSearchParams({ input_token: accessToken, access_token: appToken });
  const res = await fetch(`${GRAPH_BASE}/debug_token?${params.toString()}`);
  return res.json();
}

// Avec le flux "Facebook Login for Business" (config_id), Meta accorde des
// permissions "asset-scoped" — visibles uniquement dans
// granular_scopes[].target_ids sur /debug_token — plutôt que des
// permissions valables sur tout le compte. Dans ce cas /me/accounts (qui
// ne liste que les Pages administrées "globalement") renvoie [] même avec
// un token valide et toutes les permissions accordées : preuve obtenue
// empiriquement le 2026-07-11 (voir historique du chantier) — un token
// avec pages_show_list/pages_manage_posts accordés et is_valid=true a
// quand même produit /me/accounts → []. Les ids des Pages réellement
// accessibles sont dans target_ids ; il faut les récupérer une par une.
export function extraireIdsPagesDepuisDebugToken(debug: DonneesDebugToken): string[] {
  const scopes = debug.data?.granular_scopes ?? [];
  const ids = new Set<string>();
  for (const s of scopes) {
    if (s.scope === "pages_show_list" || s.scope === "pages_manage_posts" || s.scope === "pages_read_engagement") {
      for (const id of s.target_ids ?? []) ids.add(id);
    }
  }
  return [...ids];
}

export type PageFacebook = { id: string; name: string; access_token: string };

export async function listerPagesFacebook(userAccessToken: string): Promise<PageFacebook[]> {
  const data = await appelGraphOuErreur<{ data: PageFacebook[] }>(
    `${GRAPH_BASE}/me/accounts?access_token=${encodeURIComponent(userAccessToken)}`
  );
  return data.data ?? [];
}

// Repli utilisé quand /me/accounts renvoie [] malgré un token valide —
// va chercher chaque Page directement par son id (voir
// extraireIdsPagesDepuisDebugToken ci-dessus pour l'origine des ids).
export async function recupererPagesParId(pageIds: string[], userAccessToken: string): Promise<PageFacebook[]> {
  const resultats = await Promise.all(
    pageIds.map((id) =>
      appelGraphOuErreur<PageFacebook>(
        `${GRAPH_BASE}/${id}?fields=id,name,access_token&access_token=${encodeURIComponent(userAccessToken)}`
      ).catch((e) => {
        console.error(`[meta] Échec de la récupération de la Page ${id} par id direct:`, e);
        return null;
      })
    )
  );
  return resultats.filter((p): p is PageFacebook => p !== null);
}

// Point d'entrée unique pour obtenir les Pages d'un utilisateur — à
// utiliser partout à la place de listerPagesFacebook seul, pour ne pas
// réintroduire le bug /me/accounts vide (voir commentaires ci-dessus).
export async function listerPagesFacebookAvecRepli(userAccessToken: string): Promise<PageFacebook[]> {
  const pages = await listerPagesFacebook(userAccessToken);
  if (pages.length > 0) return pages;

  const debug = await debugToken(userAccessToken).catch((e) => {
    console.error("[meta] Échec de debug_token lors du repli granular_scopes:", e);
    return {} as DonneesDebugToken;
  });
  const idsGranulaires = extraireIdsPagesDepuisDebugToken(debug);
  if (idsGranulaires.length === 0) return [];
  return recupererPagesParId(idsGranulaires, userAccessToken);
}

// Le compte Instagram Business lié à une Page se lit via ce champ imbriqué
// — ne nécessite que pages_show_list/pages_read_engagement (déjà accordés
// dès la connexion Facebook), pas instagram_content_publish.
export async function recupererCompteInstagramLie(
  pageId: string,
  pageAccessToken: string
): Promise<{ id: string; username: string } | null> {
  const data = await appelGraphOuErreur<{
    instagram_business_account?: { id: string; username: string };
  }>(
    `${GRAPH_BASE}/${pageId}?fields=instagram_business_account{id,username}&access_token=${encodeURIComponent(pageAccessToken)}`
  );
  return data.instagram_business_account ?? null;
}

// /me/permissions reflète ce que l'utilisateur a réellement accordé lors
// du dialogue OAuth — un scope demandé dans buildMetaAuthUrl() peut être
// absent du résultat si l'app n'est pas autorisée à le demander (permission
// non ajoutée au cas d'utilisation Meta) ou si l'utilisateur l'a refusé.
export async function listerPermissionsAccordees(userAccessToken: string): Promise<{ permission: string; status: string }[]> {
  const data = await appelGraphOuErreur<{ data: { permission: string; status: string }[] }>(
    `${GRAPH_BASE}/me/permissions?access_token=${encodeURIComponent(userAccessToken)}`
  );
  return data.data ?? [];
}

export class MetaNonConnecteError extends Error {
  constructor() {
    super("Aucune Page Facebook connectée.");
  }
}

export class MetaRevoqueError extends Error {
  constructor() {
    super("La connexion Facebook a été révoquée ou a expiré. Reconnectez votre Page.");
  }
}

export class InstagramNonLieError extends Error {
  constructor() {
    super("Aucun compte Instagram Business n'est lié à cette Page Facebook.");
  }
}

export class InstagramPermissionManquanteError extends Error {
  constructor() {
    super("La publication Instagram n'est pas encore autorisée. Reconnectez Facebook pour l'activer.");
  }
}

export class InstagramConteneurEchecError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// code 190 = OAuthException (token invalide/expiré/révoqué), quel que
// soit le subcode précis (expiré, révoqué par l'utilisateur, mot de
// passe changé...) — dans tous ces cas la seule issue est de reconnecter.
function estErreurTokenInvalide(erreur: unknown): boolean {
  return (erreur as { code?: number })?.code === 190;
}

export async function obtenirPageConnectee(
  userId: string
): Promise<{ pageId: string; pageName: string; pageAccessToken: string }> {
  const { data } = await supabaseAdmin
    .from("meta_connections")
    .select("page_id, page_name, page_access_token")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data || !data.page_id || !data.page_access_token) {
    throw new MetaNonConnecteError();
  }
  return { pageId: data.page_id, pageName: data.page_name ?? data.page_id, pageAccessToken: data.page_access_token };
}

export async function obtenirCompteInstagramConnecte(
  userId: string
): Promise<{ igUserId: string; pageAccessToken: string }> {
  const { data } = await supabaseAdmin
    .from("meta_connections")
    .select("page_access_token, instagram_business_id, instagram_publish_autorise")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data || !data.page_access_token) {
    throw new MetaNonConnecteError();
  }
  if (!data.instagram_business_id) {
    throw new InstagramNonLieError();
  }
  if (!data.instagram_publish_autorise) {
    throw new InstagramPermissionManquanteError();
  }
  return { igUserId: data.instagram_business_id, pageAccessToken: data.page_access_token };
}

export async function publierSurPageFacebook({
  userId,
  pageId,
  pageAccessToken,
  message,
  photoUrl,
}: {
  userId: string;
  pageId: string;
  pageAccessToken: string;
  message: string;
  photoUrl?: string;
}): Promise<{ id: string }> {
  try {
    if (photoUrl) {
      const res = await fetch(`${GRAPH_BASE}/${pageId}/photos`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: photoUrl, caption: message, access_token: pageAccessToken }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw Object.assign(new Error(data.error?.message ?? "Échec de la publication"), { code: data.error?.code });
      return { id: data.post_id ?? data.id };
    }

    const res = await fetch(`${GRAPH_BASE}/${pageId}/feed`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message, access_token: pageAccessToken }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw Object.assign(new Error(data.error?.message ?? "Échec de la publication"), { code: data.error?.code });
    return { id: data.id };
  } catch (erreur) {
    if (estErreurTokenInvalide(erreur)) {
      await supabaseAdmin
        .from("meta_connections")
        .update({ page_id: null, page_name: null, page_access_token: null })
        .eq("user_id", userId);
      throw new MetaRevoqueError();
    }
    throw erreur;
  }
}

async function appelGraphPost<T>(chemin: string, body: Record<string, string>): Promise<T> {
  const res = await fetch(`${GRAPH_BASE}/${chemin}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    const erreur = new Error(data.error?.message ?? "Appel Graph API échoué");
    (erreur as Error & { code?: number }).code = data.error?.code;
    throw erreur;
  }
  return data as T;
}

// La publication Instagram se fait en deux temps côté Graph API : créer
// un conteneur média (image + légende), attendre qu'il soit prêt
// (status_code passe de IN_PROGRESS à FINISHED — quasi instantané pour une
// image, mais pas garanti), puis publier ce conteneur. ERROR = image
// invalide (format, taille, URL inaccessible) ou compte non éligible.
async function attendreConteneurPret(creationId: string, pageAccessToken: string): Promise<void> {
  for (let tentative = 0; tentative < 10; tentative++) {
    const data = await appelGraphOuErreur<{ status_code: string }>(
      `${GRAPH_BASE}/${creationId}?fields=status_code&access_token=${encodeURIComponent(pageAccessToken)}`
    );
    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR" || data.status_code === "EXPIRED") {
      throw new InstagramConteneurEchecError("Le conteneur média Instagram n'a pas pu être préparé (image invalide ou inaccessible).");
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new InstagramConteneurEchecError("Le conteneur média Instagram n'était pas prêt à temps.");
}

export async function publierSurInstagram({
  userId,
  igUserId,
  pageAccessToken,
  message,
  photoUrl,
}: {
  userId: string;
  igUserId: string;
  pageAccessToken: string;
  message: string;
  photoUrl: string;
}): Promise<{ id: string }> {
  try {
    const conteneur = await appelGraphPost<{ id: string }>(`${igUserId}/media`, {
      image_url: photoUrl,
      caption: message,
      access_token: pageAccessToken,
    });

    await attendreConteneurPret(conteneur.id, pageAccessToken);

    const publie = await appelGraphPost<{ id: string }>(`${igUserId}/media_publish`, {
      creation_id: conteneur.id,
      access_token: pageAccessToken,
    });
    return { id: publie.id };
  } catch (erreur) {
    if (estErreurTokenInvalide(erreur)) {
      await supabaseAdmin
        .from("meta_connections")
        .update({ instagram_publish_autorise: false })
        .eq("user_id", userId);
      throw new MetaRevoqueError();
    }
    throw erreur;
  }
}
