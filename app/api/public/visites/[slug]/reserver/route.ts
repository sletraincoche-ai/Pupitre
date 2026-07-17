import { NextRequest, NextResponse } from "next/server";
import { resoudreUserIdParSlug, resoudreCreneauPourReservation, creerReservation, VisiteError } from "@/lib/visites-server";

// V3 : reçoit (formuleId, date, heureDebut) — jamais un creneauId brut,
// car la disponibilité choisie peut être une occurrence virtuelle d'une
// règle récurrente pas encore matérialisée. Résolution/matérialisation
// systématique côté serveur avant de créer la demande (statut
// en_attente, voir lib/visites-server.ts:creerReservation).
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const userId = await resoudreUserIdParSlug(slug);
  if (!userId) return NextResponse.json({ error: "Page de réservation introuvable." }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const formuleId = typeof body.formuleId === "string" ? body.formuleId : "";
  const date = typeof body.date === "string" ? body.date : "";
  const heureDebut = typeof body.heureDebut === "string" ? body.heureDebut : "";

  try {
    const creneau = await resoudreCreneauPourReservation(userId, formuleId, date, heureDebut);
    if (!creneau) return NextResponse.json({ error: "Ce créneau n'est plus disponible." }, { status: 409 });

    const reservation = await creerReservation(userId, {
      formuleId,
      creneauId: creneau.id,
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
