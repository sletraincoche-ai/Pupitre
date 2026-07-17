import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { creerDisponibiliteRecurrente, listerDisponibilitesRecurrentes, VisiteError } from "@/lib/visites-server";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const disponibilites = await listerDisponibilitesRecurrentes(user.id);
  return NextResponse.json({ disponibilites });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));

  try {
    const disponibilite = await creerDisponibiliteRecurrente(user.id, {
      formuleId: typeof body.formuleId === "string" ? body.formuleId : "",
      jourSemaine: Number(body.jourSemaine),
      heureDebut: typeof body.heureDebut === "string" ? body.heureDebut : "",
      heureFin: typeof body.heureFin === "string" ? body.heureFin : "",
      capaciteMax: Number(body.capaciteMax),
    });
    return NextResponse.json({ disponibilite }, { status: 201 });
  } catch (erreur) {
    if (erreur instanceof VisiteError) return NextResponse.json({ error: erreur.message }, { status: erreur.status });
    throw erreur;
  }
}
