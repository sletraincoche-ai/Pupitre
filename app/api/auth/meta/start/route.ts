import { NextRequest, NextResponse } from "next/server";
import { isMetaConfigured, buildMetaAuthUrl } from "@/lib/meta";

// Point d'entrée unique du flux de connexion Meta — utilisé aussi bien par
// le bouton "Connecter" que par le QR code (scanné depuis un autre
// appareil). Bascule automatiquement entre le vrai flux OAuth et le mode
// simulation selon la présence des variables d'environnement.
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  if (isMetaConfigured()) {
    return NextResponse.redirect(buildMetaAuthUrl());
  }

  return NextResponse.redirect(`${origin}/dashboard/parametres?meta_simulate=1`);
}
