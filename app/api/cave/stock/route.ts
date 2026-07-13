import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";
import { getStockBouteillesParProduit } from "@/lib/cave-server";
import { bouteillesVersHl } from "@/lib/cave-dti";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { data: produits, error } = await supabaseAdmin
    .from("cave_produits")
    .select("id, nom, millesime, contenance_defaut, archive")
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const stocks = await getStockBouteillesParProduit(user.id);

  const lignes = (produits ?? []).map((p) => {
    const bouteilles = stocks.get(p.id) ?? 0;
    return {
      produitId: p.id,
      nom: p.nom,
      millesime: p.millesime,
      archive: p.archive,
      stockBouteilles: bouteilles,
      stockHl: bouteillesVersHl(bouteilles, p.contenance_defaut),
    };
  });

  return NextResponse.json({ stock: lignes });
}
