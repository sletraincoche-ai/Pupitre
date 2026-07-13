import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { data } = await supabaseAdmin.from("cave_parametres").select("numero_agrement").eq("user_id", user.id).maybeSingle();
  return NextResponse.json({ numeroAgrement: data?.numero_agrement ?? null });
}

export async function PUT(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));
  const numeroAgrement = typeof body.numeroAgrement === "string" ? body.numeroAgrement.trim().toUpperCase() : "";

  if (!/^[A-Z]{2}[0-9A-Z]{11}$/.test(numeroAgrement)) {
    return NextResponse.json(
      { error: "Format invalide : 13 caractères exacts, 2 lettres puis 11 lettres/chiffres (ex: FR012345E6789)." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("cave_parametres")
    .upsert({ user_id: user.id, numero_agrement: numeroAgrement, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, numeroAgrement });
}
