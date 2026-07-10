import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { hashPassword, creerSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const identifiant = typeof body?.identifiant === "string" ? body.identifiant.trim() : "";
  const motDePasse = typeof body?.motDePasse === "string" ? body.motDePasse : "";

  if (identifiant.length < 3) {
    return NextResponse.json({ error: "L'identifiant doit contenir au moins 3 caractères." }, { status: 400 });
  }
  if (motDePasse.length < 4) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 4 caractères." }, { status: 400 });
  }

  const { data: existant } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("identifiant", identifiant)
    .maybeSingle();
  if (existant) {
    return NextResponse.json({ error: "Cet identifiant est déjà utilisé." }, { status: 409 });
  }

  const passwordHash = await hashPassword(motDePasse);
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .insert({ identifiant, password_hash: passwordHash })
    .select("id, identifiant")
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "La création du compte a échoué." }, { status: 500 });
  }

  await creerSession(user.id);
  return NextResponse.json({ user: { id: user.id, identifiant: user.identifiant } });
}
