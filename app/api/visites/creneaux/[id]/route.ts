import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;

  const { data: reservationsActives } = await supabaseAdmin
    .from("visites_reservations")
    .select("id")
    .eq("creneau_id", id)
    .eq("annule", false)
    .limit(1);
  if (reservationsActives && reservationsActives.length > 0) {
    return NextResponse.json({ error: "Ce créneau a des réservations actives — annulez-les d'abord." }, { status: 409 });
  }

  const { error } = await supabaseAdmin.from("visites_creneaux").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
