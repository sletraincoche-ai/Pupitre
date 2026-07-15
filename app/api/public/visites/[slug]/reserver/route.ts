import { NextRequest, NextResponse } from "next/server";
import { resoudreUserIdParSlug, creerReservation, VisiteError } from "@/lib/visites-server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const userId = await resoudreUserIdParSlug(slug);
  if (!userId) return NextResponse.json({ error: "Page de réservation introuvable." }, { status: 404 });

  const body = await request.json().catch(() => ({}));

  try {
    const reservation = await creerReservation(userId, {
      formuleId: typeof body.formuleId === "string" ? body.formuleId : "",
      creneauId: typeof body.creneauId === "string" ? body.creneauId : undefined,
      date: typeof body.date === "string" ? body.date : "",
      heure: typeof body.heure === "string" ? body.heure : "",
      personnes: Number(body.personnes),
      visiteurNom: typeof body.visiteurNom === "string" ? body.visiteurNom : "",
      visiteurEmail: typeof body.visiteurEmail === "string" ? body.visiteurEmail : undefined,
      visiteurTelephone: typeof body.visiteurTelephone === "string" ? body.visiteurTelephone : undefined,
      langue: typeof body.langue === "string" ? body.langue : undefined,
      origine: "en_ligne",
    });
    return NextResponse.json({ reservation }, { status: 201 });
  } catch (erreur) {
    if (erreur instanceof VisiteError) return NextResponse.json({ error: erreur.message }, { status: erreur.status });
    throw erreur;
  }
}
