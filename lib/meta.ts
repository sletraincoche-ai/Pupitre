// Intégration Meta (Instagram & Facebook) — utilisé uniquement côté serveur
// (routes API). Ne jamais importer ce fichier depuis un composant client :
// META_APP_SECRET ne doit jamais atteindre le bundle navigateur.

export const META_OAUTH_SCOPES = [
  "instagram_basic",
  "instagram_content_publish",
  "pages_show_list",
  "pages_read_engagement",
];

export function isMetaConfigured(): boolean {
  return !!process.env.META_APP_ID && !!process.env.META_APP_SECRET;
}

export function buildMetaAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID ?? "",
    redirect_uri: process.env.META_REDIRECT_URI ?? "",
    scope: META_OAUTH_SCOPES.join(","),
    response_type: "code",
    ...(state ? { state } : {}),
  });
  return `https://www.facebook.com/dialog/oauth?${params.toString()}`;
}
