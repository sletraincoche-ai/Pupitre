import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { MAPPING_MOUVEMENT_DTI, type TypeMouvement } from "@/lib/cave-dti";
import { creerTicketCaisse } from "@/lib/caisse";

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

// Seuil appliqué uniquement aux pertes ("perte importante" dans le
// brief Cave — une casse d'une bouteille ne mérite pas un événement
// Agenda). Tirage, dégorgement et toute vente déclenchent
// systématiquement un événement, quelle que soit la quantité.
const SEUIL_PERTE_IMPORTANTE = 12;

export class MouvementCaveError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type ParametresMouvementCave = {
  produitId: string;
  type: TypeMouvement;
  quantiteBouteilles: number;
  contenance?: string;
  origine?: string;
  clientId?: string;
  clientNom?: string;
  prixUnitaire?: number;
  observations?: string;
  compteCapsuleId?: string;
};

// Point d'entrée UNIQUE pour créer un mouvement de cave — utilisé par
// POST /api/cave/mouvements ET par Facturation (émission d'une
// facture/BL, transformation d'une vente comptoir). Jamais de logique
// dupliquée : c'est la même vérification RG13, le même mapping DTI+, le
// même déclenchement d'événement Agenda, quel que soit l'appelant —
// exigence explicite du brief Facturation ("même mécanisme que les
// mouvements existants, pas une table parallèle").
export async function creerMouvementCave(userId: string, auteur: string, params: ParametresMouvementCave) {
  const { produitId, type, quantiteBouteilles: quantite } = params;

  if (!produitId) throw new MouvementCaveError("produitId requis.", 400);
  if (!(type in MAPPING_MOUVEMENT_DTI)) throw new MouvementCaveError("Type de mouvement invalide.", 400);
  if (!Number.isInteger(quantite) || quantite <= 0) {
    throw new MouvementCaveError("quantiteBouteilles doit être un entier positif.", 400);
  }

  const { data: produit } = await supabaseAdmin
    .from("cave_produits")
    .select("id, contenance_defaut")
    .eq("id", produitId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!produit) throw new MouvementCaveError("Produit introuvable.", 404);

  const mapping = MAPPING_MOUVEMENT_DTI[type];
  const observations = params.observations?.trim() ?? "";

  if (mapping.observationObligatoire && !observations) {
    throw new MouvementCaveError(
      'Observation requise pour ce type de mouvement (compté en "autres-sorties" du DTI+, RG19 impose un commentaire).',
      400
    );
  }

  // RG13 du XSD : le stock théorique de fin de période ne peut jamais
  // être négatif — vérifié à la saisie plutôt qu'au moment de l'export.
  if (mapping.sens === "sortie" && mapping.champDti) {
    const disponible = await getStockDisponible(userId, produitId);
    if (quantite > disponible) {
      throw new MouvementCaveError(`Stock insuffisant : ${disponible} bouteille(s) disponible(s), ${quantite} demandée(s).`, 409);
    }
  }

  const estVenteComptoir = type === "vente_comptoir";
  const prixUnitaire = typeof params.prixUnitaire === "number" ? params.prixUnitaire : null;

  // La caisse anti-fraude TVA exige un ticket pour toute vente comptoir
  // (voir plus bas) — un ticket sans montant n'aurait aucun sens fiscal,
  // donc le prix devient obligatoire ici, contrairement aux autres
  // types de mouvement où il reste informatif.
  if (estVenteComptoir && (prixUnitaire === null || prixUnitaire <= 0)) {
    throw new MouvementCaveError("Le prix unitaire est requis pour une vente comptoir (ticket de caisse).", 400);
  }

  const { data: mouvement, error } = await supabaseAdmin
    .from("cave_mouvements")
    .insert({
      user_id: userId,
      produit_id: produitId,
      type,
      regime: mapping.regime,
      quantite_bouteilles: quantite,
      contenance: params.contenance ?? produit.contenance_defaut,
      origine: params.origine ?? "",
      // Vente comptoir : jamais d'identité conservée, quel que soit ce
      // qui a pu être transmis (principe fondateur du chantier Cave).
      client_id: estVenteComptoir ? null : (params.clientId ?? null),
      client_nom: estVenteComptoir ? null : (params.clientNom ?? null),
      prix_unitaire: prixUnitaire,
      montant: prixUnitaire !== null ? prixUnitaire * quantite : null,
      observations: observations || null,
      sous_categorie_dti: mapping.champDti ?? "aucune",
      auteur,
    })
    .select("*")
    .single();
  if (error) throw new MouvementCaveError(error.message, 500);

  if (type === "degorgement" && params.compteCapsuleId) {
    await supabaseAdmin.from("cave_capsules_mouvements").insert({
      user_id: userId,
      compte_id: params.compteCapsuleId,
      type: "utilisation",
      quantite,
      mouvement_id: mouvement.id,
    });
  }

  // Caisse conforme loi anti-fraude TVA (chantier Facturation) — chaque
  // vente comptoir, quel que soit l'appelant (UI Cave ou Facturation),
  // génère un ticket chaîné. Le montant TTC est identique au HT ici
  // (TVA non modélisée sur la vente comptoir simple V1 ; les vraies
  // factures avec TVA passent par Facturation, pas par ce mouvement).
  if (type === "vente_comptoir" && mouvement.montant !== null) {
    await creerTicketCaisse(userId, mouvement.id, mouvement.montant);
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
      user_id: userId,
      type_evenement: `cave.${type}`,
      date: new Date().toISOString().slice(0, 10),
      source: "cave",
      payload: { mouvement_id: mouvement.id, produit_id: produitId, quantite_bouteilles: quantite },
      declenche_contenu: type === "degorgement",
    });
  }

  return mouvement;
}
