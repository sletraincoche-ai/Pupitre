import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";
import { calculerTotaux } from "@/lib/facturation-server";

const TYPES = ["facture", "avoir", "devis", "bon_livraison"] as const;

export async function GET(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const type = request.nextUrl.searchParams.get("type");
  const statut = request.nextUrl.searchParams.get("statut");

  let requete = supabaseAdmin
    .from("facturation_documents")
    .select("*, clients(nom, profil)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (type && (TYPES as readonly string[]).includes(type)) requete = requete.eq("type", type);
  if (statut) requete = requete.eq("statut", statut);

  const { data, error } = await requete;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ documents: data ?? [] });
}

type LignePayload = {
  designation?: unknown;
  quantite?: unknown;
  prixUnitaireHt?: unknown;
  tauxTva?: unknown;
  unite?: unknown;
  caveProduitId?: unknown;
  caveMouvementId?: unknown;
};

function validerLignes(lignesBrutes: unknown): { designation: string; quantite: number; prixUnitaireHt: number; tauxTva: number; unite: string; caveProduitId: string | null; caveMouvementId: string | null }[] | null {
  if (!Array.isArray(lignesBrutes) || lignesBrutes.length === 0) return null;
  const lignes = [];
  for (const brut of lignesBrutes as LignePayload[]) {
    const designation = typeof brut.designation === "string" ? brut.designation.trim() : "";
    const quantite = Number(brut.quantite);
    const prixUnitaireHt = Number(brut.prixUnitaireHt);
    const tauxTva = brut.tauxTva !== undefined ? Number(brut.tauxTva) : 20;
    if (!designation || !Number.isFinite(quantite) || quantite <= 0 || !Number.isFinite(prixUnitaireHt)) return null;
    lignes.push({
      designation,
      quantite,
      prixUnitaireHt,
      tauxTva,
      unite: typeof brut.unite === "string" ? brut.unite : "C62",
      caveProduitId: typeof brut.caveProduitId === "string" ? brut.caveProduitId : null,
      caveMouvementId: typeof brut.caveMouvementId === "string" ? brut.caveMouvementId : null,
    });
  }
  return lignes;
}

// Crée toujours un document en brouillon — jamais de numéro attribué
// ici (RG légale : le numéro n'existe qu'à l'émission, voir
// app/api/facturation/documents/[id]/emettre). Le stock Cave n'est
// jamais touché à cette étape non plus.
export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));
  const type = body.type;
  if (!TYPES.includes(type)) return NextResponse.json({ error: "Type de document invalide." }, { status: 400 });

  const lignes = validerLignes(body.lignes);
  if (!lignes) return NextResponse.json({ error: "Au moins une ligne valide (désignation, quantité > 0, prix) est requise." }, { status: 400 });

  let clientSnapshot: { nom: string | null; adresse: string | null; siret: string | null; tva: string | null } = {
    nom: null,
    adresse: null,
    siret: null,
    tva: null,
  };
  if (typeof body.clientId === "string") {
    const { data: client } = await supabaseAdmin
      .from("clients")
      .select("nom, adresse, code_postal, ville, siret, tva_intracommunautaire")
      .eq("id", body.clientId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!client) return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
    clientSnapshot = {
      nom: client.nom,
      adresse: [client.adresse, client.code_postal, client.ville].filter(Boolean).join(", ") || null,
      siret: client.siret,
      tva: client.tva_intracommunautaire,
    };
  }

  const { totalHt, totalTva, totalTtc } = calculerTotaux(lignes.map((l) => ({ quantite: l.quantite, prixUnitaireHt: l.prixUnitaireHt, tauxTva: l.tauxTva })));

  const { data: document, error } = await supabaseAdmin
    .from("facturation_documents")
    .insert({
      user_id: user.id,
      type,
      statut: "brouillon",
      client_id: typeof body.clientId === "string" ? body.clientId : null,
      client_nom_snapshot: clientSnapshot.nom,
      client_adresse_snapshot: clientSnapshot.adresse,
      client_siret_snapshot: clientSnapshot.siret,
      client_tva_snapshot: clientSnapshot.tva,
      document_source_id: typeof body.documentSourceId === "string" ? body.documentSourceId : null,
      date_echeance: typeof body.dateEcheance === "string" ? body.dateEcheance : null,
      document_type_code: type === "avoir" ? "381" : "380",
      total_ht: totalHt,
      total_tva: totalTva,
      total_ttc: totalTtc,
      mode_paiement: typeof body.modePaiement === "string" ? body.modePaiement : null,
      code_moyen_paiement: typeof body.codeMoyenPaiement === "string" ? body.codeMoyenPaiement : null,
      observations: typeof body.observations === "string" ? body.observations : null,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { error: erreurLignes } = await supabaseAdmin.from("facturation_lignes").insert(
    lignes.map((l, index) => ({
      document_id: document.id,
      designation: l.designation,
      quantite: l.quantite,
      unite: l.unite,
      prix_unitaire_ht: l.prixUnitaireHt,
      taux_tva: l.tauxTva,
      montant_ht: Math.round(l.quantite * l.prixUnitaireHt * 100) / 100,
      cave_produit_id: l.caveProduitId,
      cave_mouvement_id: l.caveMouvementId,
      ordre: index,
    }))
  );
  if (erreurLignes) return NextResponse.json({ error: erreurLignes.message }, { status: 500 });

  return NextResponse.json({ document }, { status: 201 });
}
