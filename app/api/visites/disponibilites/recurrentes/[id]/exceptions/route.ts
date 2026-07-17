import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { ajouterExceptionDisponibilite, listerExceptionsDisponibilite, VisiteError } from "@/lib/visites-server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;

  const exceptions = await listerExceptionsDisponibilite(user.id, id);
  return NextResponse.json({ exceptions });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));

  try {
    const exception = await ajouterExceptionDisponibilite(user.id, id, typeof body.date === "string" ? body.date : "", typeof body.motif === "string" ? body.motif : undefined);
    return NextResponse.json({ exception }, { status: 201 });
  } catch (erreur) {
    if (erreur instanceof VisiteError) return NextResponse.json({ error: erreur.message }, { status: erreur.status });
    throw erreur;
  }
}
