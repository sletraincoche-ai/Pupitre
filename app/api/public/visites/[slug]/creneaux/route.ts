import { NextRequest, NextResponse } from "next/server";
import { resoudreUserIdParSlug, listerCreneauxDisponibles } from "@/lib/visites-server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const userId = await resoudreUserIdParSlug(slug);
  if (!userId) return NextResponse.json({ error: "Page de réservation introuvable." }, { status: 404 });

  const formuleId = request.nextUrl.searchParams.get("formuleId") ?? undefined;
  const creneaux = await listerCreneauxDisponibles(userId, formuleId);

  return NextResponse.json({ creneaux });
}
