import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyPassword, creerSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const identifiant = typeof body?.identifiant === "string" ? body.identifiant.trim() : "";
  const motDePasse = typeof body?.motDePasse === "string" ? body.motDePasse : "";

  if (!identifiant || !motDePasse) {
    return NextResponse.json({ error: "Identifiant et mot de passe requis." }, { status: 400 });
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id, identifiant, password_hash")
    .eq("identifiant", identifiant)
    .maybeSingle();

  if (!user || !(await verifyPassword(motDePasse, user.password_hash))) {
    return NextResponse.json({ error: "Identifiant ou mot de passe incorrect." }, { status: 401 });
  }

  await creerSession(user.id);
  return NextResponse.json({ user: { id: user.id, identifiant: user.identifiant } });
}
