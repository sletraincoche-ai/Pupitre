import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";
import { MAPPING_MOUVEMENT_DTI, type TypeMouvement } from "@/lib/cave-dti";
import { getStockDisponible } from "@/lib/cave-server";

// Seuil appliqué uniquement aux pertes ("perte importante" dans le
// brief — une casse d'une bouteille ne mérite pas un événement Agenda).
// Tirage, dégorgement et toute vente déclenchent systématiquement un
// événement, quelle que soit la quantité — voir `significatif` plus bas.
const SEUIL_PERTE_IMPORTANTE = 12;

function estTypeValide(type: unknown): type is TypeMouvement {
  return typeof type === "string" && type in MAPPING_MOUVEMENT_DTI;
}

export async function GET(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const mois = request.nextUrl.searchParams.get("mois"); // "AAAA-MM"
  const depuis = request.nextUrl.searchParams.get("depuis"); // "AAAA-MM-JJ", borne inférieure incluse, mutuellement exclusif avec mois

  let requete = supabaseAdmin
    .from("cave_mouvements")
    .select("*, cave_produits(nom, millesime)")
    .eq("user_id", user.id)
    .order("horodatage", { ascending: false });

  if (mois && /^\d{4}-\d{2}$/.test(mois)) {
    const debut = `${mois}-01`;
    const [annee, m] = mois.split("-").map(Number);
    const finExclue = new Date(Date.UTC(annee, m, 1)).toISOString().slice(0, 10);
    requete = requete.gte("horodatage", debut).lt("horodatage", finExclue);
  } else if (depuis && /^\d{4}-\d{2}-\d{2}$/.test(depuis)) {
    requete = requete.gte("horodatage", depuis);
  }

  const { data, error } = await requete;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ mouvements: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));
  const produitId = typeof body.produitId === "string" ? body.produitId : "";
  const type = body.type;
  const quantite = Number(body.quantiteBouteilles);
  const observations = typeof body.observations === "string" ? body.observations.trim() : "";

  if (!produitId) return NextResponse.json({ error: "produitId requis." }, { status: 400 });
  if (!estTypeValide(type)) return NextResponse.json({ error: "Type de mouvement invalide." }, { status: 400 });
  if (!Number.isInteger(quantite) || quantite <= 0) {
    return NextResponse.json({ error: "quantiteBouteilles doit être un entier positif." }, { status: 400 });
  }

  const { data: produit } = await supabaseAdmin
    .from("cave_produits")
    .select("id, contenance_defaut")
    .eq("id", produitId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!produit) return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });

  const mapping = MAPPING_MOUVEMENT_DTI[type];

  if (mapping.observationObligatoire && !observations) {
    return NextResponse.json(
      { error: "Observation requise pour ce type de mouvement (compté en \"autres-sorties\" du DTI+, RG19 impose un commentaire)." },
      { status: 400 }
    );
  }

  // RG13 du XSD : le stock théorique de fin de période ne peut jamais
  // être négatif — vérifié à la saisie plutôt qu'au moment de l'export,
  // pour ne jamais laisser l'utilisateur produire un mouvement invalide.
  if (mapping.sens === "sortie" && mapping.champDti) {
    const disponible = await getStockDisponible(user.id, produitId);
    if (quantite > disponible) {
      return NextResponse.json(
        { error: `Stock insuffisant : ${disponible} bouteille(s) disponible(s), ${quantite} demandée(s).` },
        { status: 409 }
      );
    }
  }

  const estVenteComptoir = type === "vente_comptoir";
  const prixUnitaire = typeof body.prixUnitaire === "number" ? body.prixUnitaire : null;

  const { data: mouvement, error } = await supabaseAdmin
    .from("cave_mouvements")
    .insert({
      user_id: user.id,
      produit_id: produitId,
      type,
      regime: mapping.regime,
      quantite_bouteilles: quantite,
      contenance: typeof body.contenance === "string" ? body.contenance : produit.contenance_defaut,
      origine: typeof body.origine === "string" ? body.origine : "",
      // Vente comptoir : jamais d'identité conservée, quel que soit ce
      // que le client a pu envoyer (principe fondateur du chantier).
      client_id: estVenteComptoir ? null : (typeof body.clientId === "string" ? body.clientId : null),
      client_nom: estVenteComptoir ? null : (typeof body.clientNom === "string" ? body.clientNom : null),
      prix_unitaire: prixUnitaire,
      montant: prixUnitaire !== null ? prixUnitaire * quantite : null,
      observations: observations || null,
      sous_categorie_dti: mapping.champDti ?? "aucune",
      auteur: user.identifiant,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (type === "degorgement" && typeof body.compteCapsuleId === "string") {
    await supabaseAdmin.from("cave_capsules_mouvements").insert({
      user_id: user.id,
      compte_id: body.compteCapsuleId,
      type: "utilisation",
      quantite,
      mouvement_id: mouvement.id,
    });
  }

  const significatif =
    type === "tirage" ||
    type === "degorgement" ||
    type === "vente_comptoir" ||
    type === "vente_client" ||
    type === "export" ||
    (type === "perte" && quantite >= SEUIL_PERTE_IMPORTANTE);
  if (significatif) {
    await supabaseAdmin.from("evenements").insert({
      user_id: user.id,
      type_evenement: `cave.${type}`,
      date: new Date().toISOString().slice(0, 10),
      source: "cave",
      payload: { mouvement_id: mouvement.id, produit_id: produitId, quantite_bouteilles: quantite },
      declenche_contenu: type === "degorgement",
    });
  }

  return NextResponse.json({ mouvement }, { status: 201 });
}
