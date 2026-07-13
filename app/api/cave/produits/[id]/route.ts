import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

// libelle_personnalise n'apparaît jamais dans les champs modifiables ici
// — RG4 du XSD DTI+ : identifiant permanent une fois créé (voir
// supabase/schema.sql, cave_produits).
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  if (typeof body.nom === "string") patch.nom = body.nom.trim();
  if (typeof body.millesime === "string") patch.millesime = body.millesime;
  if (typeof body.tav === "number") patch.tav = body.tav;
  if (typeof body.premix === "boolean") patch.premix = body.premix;
  if (typeof body.contenanceDefaut === "string") patch.contenance_defaut = body.contenanceDefaut;
  if (typeof body.prixVenteDefaut === "number") patch.prix_vente_defaut = body.prixVenteDefaut;
  if (typeof body.archive === "boolean") patch.archive = body.archive;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Aucun champ modifiable fourni." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("cave_produits")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });

  return NextResponse.json({ produit: data });
}
