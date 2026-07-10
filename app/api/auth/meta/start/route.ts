import { NextRequest, NextResponse } from "next/server";
import { isMetaConfigured, buildMetaAuthUrl } from "@/lib/meta";

// N'autorise que des chemins internes du dashboard comme page de retour —
// jamais une URL arbitraire fournie par la query string (open redirect).
function sanitizeRetour(valeur: string | null): string {
  if (valeur && valeur.startsWith("/dashboard/")) return valeur;
  return "/dashboard/parametres";
}

// Point d'entrée unique du flux de connexion Meta — utilisé aussi bien par
// le bouton "Connecter" que par le QR code (scanné depuis un autre
// appareil), depuis Paramètres ou directement depuis Studio IA. Bascule
// automatiquement entre le vrai flux OAuth et le mode simulation selon la
// présence des variables d'environnement.
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const retour = sanitizeRetour(request.nextUrl.searchParams.get("retour"));

  if (isMetaConfigured()) {
    return NextResponse.redirect(buildMetaAuthUrl(retour));
  }

  return NextResponse.redirect(`${origin}${retour}?meta_simulate=1`);
}
