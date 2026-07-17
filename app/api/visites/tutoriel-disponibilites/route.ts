import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

// Statut "déjà vu" du tutoriel spotlight de l'onglet "Mes
// disponibilités" — même mécanique de persistance que le tunnel Studio
// IA (lu une fois au chargement, marqué côté serveur), table dédiée
// plutôt qu'une colonne sur onboarding_state (voir schema.sql :
// onboarding_state utilise l'absence de rang pour détecter le premier
// accès à Studio IA, un rang créé depuis Visites le casserait). Pas de
// reprise par étape nécessaire ici (contrairement au tunnel) : un simple
// flag suffit, le bouton "?" permet de rejouer le tutoriel à volonté
// sans jamais toucher à ce flag.
export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { data } = await supabaseAdmin.from("visites_dispo_tutoriel_state").select("vu").eq("user_id", user.id).maybeSingle();
  return NextResponse.json({ vu: data?.vu ?? false });
}

export async function PUT() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { error } = await supabaseAdmin
    .from("visites_dispo_tutoriel_state")
    .upsert({ user_id: user.id, vu: true, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
