import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supprimerExceptionDisponibilite, VisiteError } from "@/lib/visites-server";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;

  try {
    await supprimerExceptionDisponibilite(user.id, id);
    return NextResponse.json({ ok: true });
  } catch (erreur) {
    if (erreur instanceof VisiteError) return NextResponse.json({ error: erreur.message }, { status: erreur.status });
    throw erreur;
  }
}
