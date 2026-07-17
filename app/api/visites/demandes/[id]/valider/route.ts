import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { validerDemande, VisiteError } from "@/lib/visites-server";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;

  try {
    const reservation = await validerDemande(user.id, id);
    return NextResponse.json({ reservation });
  } catch (erreur) {
    if (erreur instanceof VisiteError) return NextResponse.json({ error: erreur.message }, { status: erreur.status });
    throw erreur;
  }
}
