import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";
import { MENTION_PENALITES_RETARD_DEFAUT } from "@/lib/facturation-server";

const CHAMPS = [
  "raison_sociale",
  "forme_juridique",
  "capital_social",
  "siret",
  "tva_intracommunautaire",
  "rcs_ville",
  "adresse",
  "code_postal",
  "ville",
  "pays",
  "iban",
  "bic",
  "mention_penalites_retard",
] as const;

// Mêmes paramètres domaine que Cave (cave_parametres) — voir brief
// Facturation : "lire... depuis Paramètres, jamais les recoder en dur".
export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { data } = await supabaseAdmin.from("cave_parametres").select(CHAMPS.join(",")).eq("user_id", user.id).maybeSingle();
  return NextResponse.json({ parametres: data ?? null });
}

export async function PUT(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));
  const patch: Record<string, unknown> = { user_id: user.id, updated_at: new Date().toISOString() };
  for (const champ of CHAMPS) {
    if (champ in body) patch[champ] = body[champ];
  }
  // Préremplit le texte légal par défaut au premier enregistrement
  // uniquement — jamais écrasé ensuite si l'utilisateur l'a personnalisé.
  if (!("mention_penalites_retard" in patch)) {
    const { data: existant } = await supabaseAdmin.from("cave_parametres").select("mention_penalites_retard").eq("user_id", user.id).maybeSingle();
    if (!existant?.mention_penalites_retard) patch.mention_penalites_retard = MENTION_PENALITES_RETARD_DEFAUT;
  }

  const { data, error } = await supabaseAdmin.from("cave_parametres").upsert(patch).select(CHAMPS.join(",")).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ parametres: data });
}
