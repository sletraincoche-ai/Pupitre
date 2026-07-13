import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

// Ventes comptoir de Cave pas encore rattachées à une facture — pour la
// transformation a posteriori demandée par le brief ("si le client le
// demande"). Une vente déjà présente dans facturation_lignes.cave_mouvement_id
// n'est plus proposée ici (une seule facture par mouvement).
export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { data: mouvements, error } = await supabaseAdmin
    .from("cave_mouvements")
    .select("id, produit_id, quantite_bouteilles, prix_unitaire, montant, horodatage, cave_produits(nom, millesime)")
    .eq("user_id", user.id)
    .eq("type", "vente_comptoir")
    .eq("annule", false)
    .order("horodatage", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: lignesLiees } = await supabaseAdmin.from("facturation_lignes").select("cave_mouvement_id").not("cave_mouvement_id", "is", null);
  const idsDejaFactures = new Set((lignesLiees ?? []).map((l) => l.cave_mouvement_id));

  const disponibles = (mouvements ?? []).filter((m) => !idsDejaFactures.has(m.id));
  return NextResponse.json({ ventes: disponibles });
}
