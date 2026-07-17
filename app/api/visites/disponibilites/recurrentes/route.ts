import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { creerDisponibilitesRecurrentes, listerDisponibilitesRecurrentes, VisiteError } from "@/lib/visites-server";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const disponibilites = await listerDisponibilitesRecurrentes(user.id);
  return NextResponse.json({ disponibilites });
}

// Création en masse (V4) — plusieurs jours × plusieurs formules sur une
// même plage horaire en un seul geste. Les formules dont la durée ne
// rentre pas dans la plage sont écartées silencieusement, jamais en
// erreur bloquante, et remontées dans `ecartees`.
export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));

  try {
    const resultat = await creerDisponibilitesRecurrentes(user.id, {
      formuleIds: Array.isArray(body.formuleIds) ? body.formuleIds.filter((f: unknown) => typeof f === "string") : [],
      joursSemaine: Array.isArray(body.joursSemaine) ? body.joursSemaine.map(Number) : [],
      heureDebut: typeof body.heureDebut === "string" ? body.heureDebut : "",
      heureFin: typeof body.heureFin === "string" ? body.heureFin : "",
      capaciteMax: Number(body.capaciteMax),
    });
    return NextResponse.json(resultat, { status: 201 });
  } catch (erreur) {
    if (erreur instanceof VisiteError) return NextResponse.json({ error: erreur.message }, { status: erreur.status });
    throw erreur;
  }
}
