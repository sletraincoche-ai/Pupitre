import { NextRequest, NextResponse } from "next/server";
import { isMetaConfigured, buildMetaAuthUrl } from "@/lib/meta";
import { getCurrentUser } from "@/lib/auth";

// N'autorise que des chemins internes du dashboard comme page de retour —
// jamais une URL arbitraire fournie par la query string (open redirect).
function sanitizeRetour(valeur: string | null): string {
  if (valeur && valeur.startsWith("/dashboard/")) return valeur;
  return "/dashboard/studio";
}

// Point d'entrée du flux de connexion Meta (Facebook uniquement — voir
// lib/meta.ts). Le `state` transporte la page de retour, encodée pour
// traverser sans altération le dialogue OAuth de Facebook.
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const retour = sanitizeRetour(request.nextUrl.searchParams.get("retour"));

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/dashboard/studio`);
  }

  if (!isMetaConfigured()) {
    return NextResponse.redirect(`${origin}${retour}?meta_error=not_configured`);
  }

  const state = Buffer.from(JSON.stringify({ retour })).toString("base64url");
  return NextResponse.redirect(buildMetaAuthUrl(state));
}
