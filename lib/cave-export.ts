import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { bouteillesVersHl } from "@/lib/cave-dti";

// Générateur d'export DRM au format DTI+ viticole (v18, XSD 1.0.14,
// docs/dti-plus/) — structure et ordre des éléments alignés caractère
// pour caractère sur le XSD officiel lu directement (voir
// docs/dti-plus/ciel-dti-plus-viti_v1.0.14.xsd) et sur l'exemple DGDDI
// (exemple-officiel-viti.xml). HYPOTHÈSE V1 (voir lib/cave-dti.ts) :
// tout le cycle de vie du vin reste en droits-suspendus (capsules CRD
// personnalisées) — droits-acquittes n'est jamais émis par ce
// générateur en V1.

export class DrmValidationError extends Error {}

function echapper(valeur: string): string {
  return valeur.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// VolumeType/VolumeStockType : décimal, 5 décimales max. On formate avec
// exactement 5 décimales (valide côté XSD — fractionDigits est un
// maximum, pas une exigence d'exactitude) pour rester simple et stable.
function formatVolume(hl: number): string {
  return hl.toFixed(5);
}

function moisPrecedent(periode: string): string {
  const [annee, mois] = periode.split("-").map(Number);
  const date = new Date(Date.UTC(annee, mois - 2, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function bornesPeriode(periode: string): { debut: string; finExclue: string } {
  const [annee, mois] = periode.split("-").map(Number);
  const debut = `${periode}-01`;
  const finExclue = new Date(Date.UTC(annee, mois, 1)).toISOString().slice(0, 10);
  return { debut, finExclue };
}

type SnapshotStocks = {
  produits: Record<string, number>; // produitId -> stock-fin-periode en hL (régime suspendu)
  capsules: Record<string, number>; // compteId -> stock-fin-periode en unités
};

type ProduitDeclare = {
  id: string;
  nom: string;
  libelle_personnalise: string;
  libelle_fiscal: string | null;
  code_inao: string | null;
  tav: number | null;
  premix: boolean;
  contenance_defaut: string;
};

type LigneBalanceProduit = {
  produit: ProduitDeclare;
  stockDebutHl: number;
  entreesVolumeProduitHl: number;
  ventesHl: number;
  pertesHl: number;
  observations: string | null;
  stockFinHl: number;
};

type LigneCompteCrd = {
  compte: { id: string; categorie_fiscale: string; type_capsule: string; centilisation: string; volume_personnalise: number | null; bib: boolean };
  stockDebut: number;
  entreesAchats: number;
  sortiesUtilisations: number;
  stockFin: number;
};

export async function calculerBalancePeriode(userId: string, periode: string): Promise<{
  produits: LigneBalanceProduit[];
  comptesCrd: LigneCompteCrd[];
  snapshot: SnapshotStocks;
}> {
  const { debut, finExclue } = bornesPeriode(periode);

  const { data: declarationPrecedente } = await supabaseAdmin
    .from("cave_drm_declarations")
    .select("stocks_fin_periode")
    .eq("user_id", userId)
    .eq("periode", moisPrecedent(periode))
    .maybeSingle();
  const snapshotPrecedent = declarationPrecedente?.stocks_fin_periode as SnapshotStocks | undefined;

  const { data: produits, error: erreurProduits } = await supabaseAdmin
    .from("cave_produits")
    .select("id, nom, libelle_personnalise, libelle_fiscal, code_inao, tav, premix, contenance_defaut, archive")
    .eq("user_id", userId);
  if (erreurProduits) throw new Error(erreurProduits.message);

  const { data: mouvements, error: erreurMouvements } = await supabaseAdmin
    .from("cave_mouvements")
    .select("produit_id, type, quantite_bouteilles, contenance, observations, horodatage")
    .eq("user_id", userId)
    .eq("annule", false)
    .gte("horodatage", debut)
    .lt("horodatage", finExclue);
  if (erreurMouvements) throw new Error(erreurMouvements.message);

  const lignes: LigneBalanceProduit[] = [];
  const snapshotProduits: Record<string, number> = {};

  for (const p of produits ?? []) {
    const mvtsProduit = (mouvements ?? []).filter((m) => m.produit_id === p.id);

    const stockDebutHl = snapshotPrecedent?.produits[p.id] ?? await stockPhysiqueDebutSiPremiereDeclaration(userId, p.id, declarationPrecedente ? true : false, debut);

    const entreesVolumeProduitHl = mvtsProduit
      .filter((m) => m.type === "tirage")
      .reduce((total, m) => total + bouteillesVersHl(m.quantite_bouteilles, m.contenance), 0);

    const ventesHl = mvtsProduit
      .filter((m) => m.type === "vente_comptoir" || m.type === "vente_client" || m.type === "export")
      .reduce((total, m) => total + bouteillesVersHl(m.quantite_bouteilles, m.contenance), 0);

    const pertesHl = mvtsProduit
      .filter((m) => m.type === "perte")
      .reduce((total, m) => total + bouteillesVersHl(m.quantite_bouteilles, m.contenance), 0);

    const observationsPerte = mvtsProduit
      .filter((m) => m.type === "perte" && m.observations)
      .map((m) => m.observations as string)
      .join("; ")
      .slice(0, 250);

    const stockFinHl = stockDebutHl + entreesVolumeProduitHl - ventesHl - pertesHl;

    const aDeclarer = stockDebutHl !== 0 || entreesVolumeProduitHl !== 0 || ventesHl !== 0 || pertesHl !== 0;
    if (!aDeclarer) continue; // RG16 : rien à dire ce mois-ci, produit déjà à 0 précédemment

    if (stockFinHl < -0.000001) {
      throw new DrmValidationError(
        `Stock de fin négatif pour "${p.nom}" (${stockFinHl.toFixed(5)} hL) — RG13 du XSD DTI+ l'interdit. Vérifier les mouvements du mois.`
      );
    }
    if (pertesHl > 0 && !observationsPerte) {
      throw new DrmValidationError(`Une observation est requise pour les pertes de "${p.nom}" (RG19 du XSD).`);
    }

    lignes.push({
      produit: p,
      stockDebutHl,
      entreesVolumeProduitHl,
      ventesHl,
      pertesHl,
      observations: observationsPerte || null,
      stockFinHl: Math.max(0, stockFinHl),
    });
    snapshotProduits[p.id] = Math.max(0, stockFinHl);
  }

  const { data: comptes, error: erreurComptes } = await supabaseAdmin
    .from("cave_capsules_comptes")
    .select("*")
    .eq("user_id", userId);
  if (erreurComptes) throw new Error(erreurComptes.message);

  const { data: mvtsCapsules, error: erreurMvtsCapsules } = await supabaseAdmin
    .from("cave_capsules_mouvements")
    .select("compte_id, type, quantite, horodatage")
    .eq("user_id", userId)
    .eq("annule", false)
    .gte("horodatage", debut)
    .lt("horodatage", finExclue);
  if (erreurMvtsCapsules) throw new Error(erreurMvtsCapsules.message);

  const lignesCrd: LigneCompteCrd[] = [];
  const snapshotCapsules: Record<string, number> = {};

  for (const c of comptes ?? []) {
    const mvtsCompte = (mvtsCapsules ?? []).filter((m) => m.compte_id === c.id);
    const stockDebut = snapshotPrecedent?.capsules[c.id] ?? 0;
    const entreesAchats = mvtsCompte.filter((m) => m.type === "achat").reduce((t, m) => t + m.quantite, 0);
    const sortiesUtilisations = mvtsCompte.filter((m) => m.type === "utilisation").reduce((t, m) => t + m.quantite, 0);
    const stockFin = stockDebut + entreesAchats - sortiesUtilisations;

    if (stockDebut === 0 && entreesAchats === 0 && sortiesUtilisations === 0) continue;
    if (stockFin < 0) {
      throw new DrmValidationError(`Stock de capsules négatif pour le compte ${c.categorie_fiscale}/${c.centilisation} — vérifier les mouvements du mois.`);
    }

    lignesCrd.push({ compte: c, stockDebut, entreesAchats, sortiesUtilisations, stockFin });
    snapshotCapsules[c.id] = stockFin;
  }

  return { produits: lignes, comptesCrd: lignesCrd, snapshot: { produits: snapshotProduits, capsules: snapshotCapsules } };
}

// RG9 du XSD : la toute première DRM d'un domaine ancre stock-debut sur
// l'inventaire physique réel plutôt que sur une déclaration précédente
// (qui n'existe pas). On le calcule ici depuis le registre de
// mouvements lui-même (même logique que lib/cave-server.ts).
async function stockPhysiqueDebutSiPremiereDeclaration(
  userId: string,
  produitId: string,
  aUneDeclarationPrecedente: boolean,
  debutPeriode: string
): Promise<number> {
  if (aUneDeclarationPrecedente) return 0; // snapshotPrecedent existe mais ce produit n'y était pas -> 0 par défaut
  const { data } = await supabaseAdmin
    .from("cave_mouvements")
    .select("type, quantite_bouteilles, contenance")
    .eq("user_id", userId)
    .eq("produit_id", produitId)
    .eq("annule", false)
    .lt("horodatage", debutPeriode);
  let bouteilles = 0;
  for (const m of data ?? []) {
    if (m.type === "tirage") bouteilles += m.quantite_bouteilles;
    else if (m.type === "vente_comptoir" || m.type === "vente_client" || m.type === "export" || m.type === "perte") bouteilles -= m.quantite_bouteilles;
  }
  return bouteillesVersHl(Math.max(0, bouteilles), "CL_75");
}

export async function genererXmlDti(userId: string, periode: string): Promise<{ xml: string; snapshot: SnapshotStocks }> {
  const [annee, mois] = periode.split("-").map(Number);

  const { data: parametres } = await supabaseAdmin.from("cave_parametres").select("numero_agrement").eq("user_id", userId).maybeSingle();
  const numeroAgrement = parametres?.numero_agrement;
  if (!numeroAgrement) {
    throw new DrmValidationError("Numéro d'agrément non renseigné — à saisir dans les paramètres Cave avant de générer un export.");
  }

  const { produits, comptesCrd, snapshot } = await calculerBalancePeriode(userId, periode);

  const partiesXml: string[] = [];
  partiesXml.push('<?xml version="1.0" encoding="UTF-8"?>');
  partiesXml.push(
    '<mouvements-balances xmlns="http://douane.finances.gouv.fr/app/ciel/dtiplus/v1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://douane.finances.gouv.fr/app/ciel/dtiplus/v1 ciel-dti-plus-viti_v1.0.14.xsd">'
  );
  partiesXml.push(`  <periode-taxation><mois>${mois}</mois><annee>${annee}</annee></periode-taxation>`);
  partiesXml.push(`  <identification-redevable>${echapper(numeroAgrement)}</identification-redevable>`);

  if (produits.length > 0) {
    partiesXml.push("  <droits-suspendus>");
    for (const ligne of produits) {
      partiesXml.push("    <produit>");
      if (ligne.produit.libelle_fiscal) {
        partiesXml.push(`      <libelle-fiscal>${echapper(ligne.produit.libelle_fiscal)}</libelle-fiscal>`);
      } else {
        partiesXml.push(`      <code-inao>${echapper(ligne.produit.code_inao ?? "")}</code-inao>`);
      }
      partiesXml.push(`      <libelle-personnalise>${echapper(ligne.produit.libelle_personnalise)}</libelle-personnalise>`);
      if (ligne.produit.tav !== null) partiesXml.push(`      <tav>${ligne.produit.tav.toFixed(2)}</tav>`);
      if (ligne.produit.premix) partiesXml.push("      <premix>true</premix>");
      if (ligne.observations) partiesXml.push(`      <observations>${echapper(ligne.observations)}</observations>`);
      partiesXml.push("      <balance-stock>");
      partiesXml.push(`        <stock-debut-periode>${formatVolume(ligne.stockDebutHl)}</stock-debut-periode>`);
      if (ligne.entreesVolumeProduitHl > 0) {
        partiesXml.push(`        <entrees-periode><volume-produit>${formatVolume(ligne.entreesVolumeProduitHl)}</volume-produit></entrees-periode>`);
      }
      if (ligne.ventesHl > 0 || ligne.pertesHl > 0) {
        partiesXml.push("        <sorties-periode>");
        if (ligne.ventesHl > 0) {
          partiesXml.push(`          <ventes-france-crd-suspendus><annee-courante>${formatVolume(ligne.ventesHl)}</annee-courante></ventes-france-crd-suspendus>`);
        }
        if (ligne.pertesHl > 0) {
          partiesXml.push(`          <sorties-sans-paiement-droits><autres-sorties>${formatVolume(ligne.pertesHl)}</autres-sorties></sorties-sans-paiement-droits>`);
        }
        partiesXml.push("        </sorties-periode>");
      }
      partiesXml.push(`        <stock-fin-periode>${formatVolume(ligne.stockFinHl)}</stock-fin-periode>`);
      partiesXml.push("      </balance-stock>");
      partiesXml.push("    </produit>");
    }
    partiesXml.push("  </droits-suspendus>");
  }

  for (const ligne of comptesCrd) {
    partiesXml.push("  <compte-crd>");
    partiesXml.push(`    <categorie-fiscale-capsules>${echapper(ligne.compte.categorie_fiscale)}</categorie-fiscale-capsules>`);
    partiesXml.push(`    <type-capsule>${echapper(ligne.compte.type_capsule)}</type-capsule>`);
    const attrsCentilisation = [`volume="${echapper(ligne.compte.centilisation)}"`];
    if (ligne.compte.centilisation === "AUTRE") {
      if (ligne.compte.volume_personnalise !== null) attrsCentilisation.push(`volumePersonnalise="${ligne.compte.volume_personnalise}"`);
      attrsCentilisation.push(`bib="${ligne.compte.bib}"`);
    }
    partiesXml.push(`    <centilisation ${attrsCentilisation.join(" ")}>`);
    partiesXml.push(`      <stock-debut-periode>${ligne.stockDebut}</stock-debut-periode>`);
    if (ligne.entreesAchats > 0) partiesXml.push(`      <entrees-capsules><achats>${ligne.entreesAchats}</achats></entrees-capsules>`);
    if (ligne.sortiesUtilisations > 0) partiesXml.push(`      <sorties-capsules><utilisations>${ligne.sortiesUtilisations}</utilisations></sorties-capsules>`);
    partiesXml.push(`      <stock-fin-periode>${ligne.stockFin}</stock-fin-periode>`);
    partiesXml.push("    </centilisation>");
    partiesXml.push("  </compte-crd>");
  }

  partiesXml.push("</mouvements-balances>");

  return { xml: partiesXml.join("\n"), snapshot };
}
