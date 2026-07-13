import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

// Mouvements de capsules saisis directement (achats principalement) —
// distinct de la consommation automatique par dégorgement (voir
// app/api/cave/mouvements/route.ts), qui reste le seul chemin pour le
// type "utilisation".
const TYPES_AUTORISES = ["achat", "retour", "excedent", "autre_entree"] as const;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const type = body.type;
  const quantite = Number(body.quantite);

  if (!TYPES_AUTORISES.includes(type)) {
    return NextResponse.json({ error: `Type invalide (attendu : ${TYPES_AUTORISES.join(", ")}).` }, { status: 400 });
  }
  if (!Number.isInteger(quantite) || quantite <= 0) {
    return NextResponse.json({ error: "Quantité doit être un entier positif." }, { status: 400 });
  }

  const { data: compte } = await supabaseAdmin
    .from("cave_capsules_comptes")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!compte) return NextResponse.json({ error: "Compte de capsules introuvable." }, { status: 404 });

  const { data, error } = await supabaseAdmin
    .from("cave_capsules_mouvements")
    .insert({
      user_id: user.id,
      compte_id: id,
      type,
      quantite,
      observations: typeof body.observations === "string" ? body.observations : null,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ mouvement: data }, { status: 201 });
}
