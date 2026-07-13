import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { MAPPING_MOUVEMENT_DTI, type TypeMouvement } from "@/lib/cave-dti";

export type MouvementLigne = {
  id: string;
  produit_id: string;
  type: TypeMouvement;
  quantite_bouteilles: number;
  date: string; // AAAA-MM-JJ, dérivé de horodatage
};

// Stock en bouteilles par produit, régime confondu (droits-suspendus
// uniquement en V1 — voir HYPOTHÈSE dans lib/cave-dti.ts). Un dégorgement
// n'entre jamais dans ce calcul : il ne change ni le nombre de
// bouteilles ni le volume, seul son champDti (null) le signale comme
// tel — voir MAPPING_MOUVEMENT_DTI.
export async function getStockBouteillesParProduit(
  userId: string,
  jusquExclu?: string // AAAA-MM-JJ, borne exclusive — omis = tout l'historique
): Promise<Map<string, number>> {
  let requete = supabaseAdmin
    .from("cave_mouvements")
    .select("produit_id, type, quantite_bouteilles, horodatage")
    .eq("user_id", userId)
    .eq("annule", false);
  if (jusquExclu) requete = requete.lt("horodatage", `${jusquExclu}T00:00:00.000Z`);

  const { data, error } = await requete;
  if (error) throw new Error(error.message);

  const stock = new Map<string, number>();
  for (const m of data ?? []) {
    const mapping = MAPPING_MOUVEMENT_DTI[m.type as TypeMouvement];
    if (!mapping.champDti) continue; // dégorgement : ne compte pas
    const delta = mapping.sens === "entree" ? m.quantite_bouteilles : -m.quantite_bouteilles;
    stock.set(m.produit_id, (stock.get(m.produit_id) ?? 0) + delta);
  }
  return stock;
}

export async function getStockDisponible(userId: string, produitId: string): Promise<number> {
  const stocks = await getStockBouteillesParProduit(userId);
  return stocks.get(produitId) ?? 0;
}
