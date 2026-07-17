import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { modifierDisponibiliteRecurrente, VisiteError } from "@/lib/visites-server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  if (typeof body.actif !== "boolean") return NextResponse.json({ error: "actif (booléen) requis." }, { status: 400 });

  try {
    const disponibilite = await modifierDisponibiliteRecurrente(user.id, id, body.actif);
    return NextResponse.json({ disponibilite });
  } catch (erreur) {
    if (erreur instanceof VisiteError) return NextResponse.json({ error: erreur.message }, { status: erreur.status });
    throw erreur;
  }
}
