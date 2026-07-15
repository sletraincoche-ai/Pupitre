import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { terminerVisite, VisiteError } from "@/lib/visites-server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const noteAnecdote = typeof body.noteAnecdote === "string" ? body.noteAnecdote : undefined;

  try {
    const reservation = await terminerVisite(user.id, id, noteAnecdote);
    return NextResponse.json({ reservation });
  } catch (erreur) {
    if (erreur instanceof VisiteError) return NextResponse.json({ error: erreur.message }, { status: erreur.status });
    throw erreur;
  }
}
