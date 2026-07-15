import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { annulerReservation, VisiteError } from "@/lib/visites-server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const motif = typeof body.motif === "string" ? body.motif : "";

  try {
    const reservation = await annulerReservation(user.id, id, motif);
    return NextResponse.json({ reservation });
  } catch (erreur) {
    if (erreur instanceof VisiteError) return NextResponse.json({ error: erreur.message }, { status: erreur.status });
    throw erreur;
  }
}
