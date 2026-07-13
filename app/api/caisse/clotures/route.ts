import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";
import { creerCloture } from "@/lib/caisse";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { data, error } = await supabaseAdmin
    .from("caisse_clotures")
    .select("*")
    .eq("user_id", user.id)
    .order("periode", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ clotures: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));
  const type = body.type;
  const periode = typeof body.periode === "string" ? body.periode : "";

  if (!["journaliere", "mensuelle", "annuelle"].includes(type)) {
    return NextResponse.json({ error: "Type de clôture invalide." }, { status: 400 });
  }
  if (!periode) return NextResponse.json({ error: "periode requise." }, { status: 400 });

  try {
    const cloture = await creerCloture(user.id, type, periode);
    return NextResponse.json({ cloture }, { status: 201 });
  } catch (erreur) {
    return NextResponse.json({ error: erreur instanceof Error ? erreur.message : "Échec de la clôture." }, { status: 500 });
  }
}
