import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { data, error } = await supabaseAdmin
    .from("cave_produits")
    .select("*")
    .eq("user_id", user.id)
    .order("archive", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ produits: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));
  const nom = typeof body.nom === "string" ? body.nom.trim() : "";
  const libellePersonnalise = typeof body.libellePersonnalise === "string" ? body.libellePersonnalise.trim() : "";
  const libelleFiscal = typeof body.libelleFiscal === "string" ? body.libelleFiscal : null;
  const codeInao = typeof body.codeInao === "string" ? body.codeInao : null;

  if (!nom) return NextResponse.json({ error: "Nom requis." }, { status: 400 });
  if (!libellePersonnalise) return NextResponse.json({ error: "Libellé personnalisé requis (identifiant fiscal permanent)." }, { status: 400 });
  if (!libelleFiscal && !codeInao) {
    return NextResponse.json({ error: "libelle-fiscal ou code-inao requis (l'un des deux, pas les deux)." }, { status: 400 });
  }
  if (libelleFiscal && codeInao) {
    return NextResponse.json({ error: "libelle-fiscal et code-inao sont exclusifs l'un de l'autre." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("cave_produits")
    .insert({
      user_id: user.id,
      nom,
      millesime: typeof body.millesime === "string" ? body.millesime : null,
      libelle_personnalise: libellePersonnalise,
      libelle_fiscal: libelleFiscal,
      code_inao: codeInao,
      tav: typeof body.tav === "number" ? body.tav : null,
      premix: !!body.premix,
      contenance_defaut: typeof body.contenanceDefaut === "string" ? body.contenanceDefaut : "CL_75",
      prix_vente_defaut: typeof body.prixVenteDefaut === "number" ? body.prixVenteDefaut : null,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Ce libellé personnalisé existe déjà." }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ produit: data }, { status: 201 });
}
