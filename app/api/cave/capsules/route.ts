import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

// Types d'entrée vs sortie côté cave_capsules_mouvements — voir
// app/api/cave/capsules/[id]/mouvements/route.ts et
// app/api/cave/mouvements/route.ts (utilisation auto au dégorgement).
const TYPES_ENTREE = new Set(["achat", "retour", "excedent", "autre_entree"]);

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { data: comptes, error } = await supabaseAdmin.from("cave_capsules_comptes").select("*").eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: mouvements, error: erreurMouvements } = await supabaseAdmin
    .from("cave_capsules_mouvements")
    .select("compte_id, type, quantite")
    .eq("user_id", user.id)
    .eq("annule", false);
  if (erreurMouvements) return NextResponse.json({ error: erreurMouvements.message }, { status: 500 });

  const comptesAvecStock = (comptes ?? []).map((c) => {
    const stock = (mouvements ?? [])
      .filter((m) => m.compte_id === c.id)
      .reduce((total, m) => total + (TYPES_ENTREE.has(m.type) ? m.quantite : -m.quantite), 0);
    return { ...c, stock };
  });

  return NextResponse.json({ comptes: comptesAvecStock });
}

// Crée un compte CRD (catégorie/type/centilisation) — en pratique un
// seul compte suffit à la plupart des domaines Champagne V1 (M /
// PERSONNALISEES / CL_75), mais le formulaire de première utilisation
// doit pouvoir en créer un.
export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));
  const centilisation = typeof body.centilisation === "string" ? body.centilisation : "CL_75";

  const { data, error } = await supabaseAdmin
    .from("cave_capsules_comptes")
    .insert({
      user_id: user.id,
      categorie_fiscale: typeof body.categorieFiscale === "string" ? body.categorieFiscale : "M",
      type_capsule: typeof body.typeCapsule === "string" ? body.typeCapsule : "PERSONNALISEES",
      centilisation,
      volume_personnalise: centilisation === "AUTRE" && typeof body.volumePersonnalise === "number" ? body.volumePersonnalise : null,
      bib: !!body.bib,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Ce compte CRD existe déjà." }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ compte: data }, { status: 201 });
}
