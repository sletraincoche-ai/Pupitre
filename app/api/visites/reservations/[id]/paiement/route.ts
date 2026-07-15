import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { marquerPaiementSurPlace, VisiteError } from "@/lib/visites-server";

// Carte manuelle "payé" pour un règlement sur place (walk-in ou visiteur
// en ligne qui n'a pas pu payer par carte faute de Stripe configuré).
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const moyenPaiement = typeof body.moyenPaiement === "string" ? body.moyenPaiement : "";
  if (!moyenPaiement) return NextResponse.json({ error: "Moyen de paiement requis." }, { status: 400 });

  try {
    const reservation = await marquerPaiementSurPlace(user.id, id, moyenPaiement);
    return NextResponse.json({ reservation });
  } catch (erreur) {
    if (erreur instanceof VisiteError) return NextResponse.json({ error: erreur.message }, { status: erreur.status });
    throw erreur;
  }
}
