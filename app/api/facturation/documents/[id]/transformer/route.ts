import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";
import { calculerTotaux } from "@/lib/facturation-server";

const CIBLES_AUTORISEES: Record<string, string[]> = {
  devis: ["facture", "bon_livraison"],
  bon_livraison: ["facture"],
};

// Transforme un devis (jamais touché le stock) ou un bon de livraison
// émis (a déjà bougé le stock) en un nouveau document brouillon. Copie
// les lignes SANS dupliquer un mouvement de cave déjà existant : si la
// ligne source portait un cave_mouvement_id (cas du BL), il est repris
// tel quel — à l'émission du nouveau document, cette ligne sera donc
// ignorée par la création de mouvement (déjà liée), pas de double
// comptage de stock. Si la ligne venait d'un devis (jamais de
// mouvement), le nouveau document en créera un à SA propre émission.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const versType = typeof body.versType === "string" ? body.versType : "";

  const { data: source } = await supabaseAdmin.from("facturation_documents").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!source) return NextResponse.json({ error: "Document source introuvable." }, { status: 404 });
  if (source.statut !== "emis") return NextResponse.json({ error: "Seul un document émis peut être transformé." }, { status: 409 });

  const ciblesValides = CIBLES_AUTORISEES[source.type] ?? [];
  if (!ciblesValides.includes(versType)) {
    return NextResponse.json({ error: `Transformation ${source.type} → ${versType} non autorisée.` }, { status: 400 });
  }

  const { data: lignesSource } = await supabaseAdmin.from("facturation_lignes").select("*").eq("document_id", id).order("ordre", { ascending: true });

  const { data: nouveauDocument, error } = await supabaseAdmin
    .from("facturation_documents")
    .insert({
      user_id: user.id,
      type: versType,
      statut: "brouillon",
      client_id: source.client_id,
      client_nom_snapshot: source.client_nom_snapshot,
      client_adresse_snapshot: source.client_adresse_snapshot,
      client_siret_snapshot: source.client_siret_snapshot,
      client_tva_snapshot: source.client_tva_snapshot,
      document_source_id: source.id,
      document_type_code: versType === "avoir" ? "381" : "380",
      total_ht: source.total_ht,
      total_tva: source.total_tva,
      total_ttc: source.total_ttc,
      mode_paiement: source.mode_paiement,
      code_moyen_paiement: source.code_moyen_paiement,
      observations: source.observations,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const lignes = (lignesSource ?? []).map((l, index) => ({
    document_id: nouveauDocument.id,
    designation: l.designation,
    quantite: l.quantite,
    unite: l.unite,
    prix_unitaire_ht: l.prix_unitaire_ht,
    taux_tva: l.taux_tva,
    code_categorie_tva: l.code_categorie_tva,
    montant_ht: l.montant_ht,
    cave_produit_id: l.cave_produit_id,
    // Repris tel quel — voir commentaire en tête de fichier.
    cave_mouvement_id: l.cave_mouvement_id,
    ordre: index,
  }));
  if (lignes.length > 0) {
    const { error: erreurLignes } = await supabaseAdmin.from("facturation_lignes").insert(lignes);
    if (erreurLignes) return NextResponse.json({ error: erreurLignes.message }, { status: 500 });
  }

  // Recalcul par sécurité plutôt qu'une copie aveugle des totaux source
  // (les deux devraient déjà concorder, mais ne jamais faire confiance
  // à un total stocké sans le revérifier après une copie de lignes).
  const { totalHt, totalTva, totalTtc } = calculerTotaux(lignes.map((l) => ({ quantite: l.quantite, prixUnitaireHt: l.prix_unitaire_ht, tauxTva: l.taux_tva })));
  await supabaseAdmin.from("facturation_documents").update({ total_ht: totalHt, total_tva: totalTva, total_ttc: totalTtc }).eq("id", nouveauDocument.id);

  return NextResponse.json({ document: { ...nouveauDocument, total_ht: totalHt, total_tva: totalTva, total_ttc: totalTtc } }, { status: 201 });
}
