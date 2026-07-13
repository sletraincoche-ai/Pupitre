import "server-only";

export type LigneCalcul = { quantite: number; prixUnitaireHt: number; tauxTva: number };

// Arrondi à 2 décimales à CHAQUE étape (par ligne, puis sur les totaux)
// — jamais un arrondi global en fin de calcul, pour rester cohérent
// avec ce qu'affiche chaque ligne de la facture (BR-CO-* de la norme
// EN 16931 : cohérence arithmétique stricte lignes/totaux).
export function calculerTotaux(lignes: LigneCalcul[]): { totalHt: number; totalTva: number; totalTtc: number } {
  let totalHt = 0;
  let totalTva = 0;
  for (const ligne of lignes) {
    const montantLigneHt = Math.round(ligne.quantite * ligne.prixUnitaireHt * 100) / 100;
    const tvaLigne = Math.round(montantLigneHt * (ligne.tauxTva / 100) * 100) / 100;
    totalHt += montantLigneHt;
    totalTva += tvaLigne;
  }
  totalHt = Math.round(totalHt * 100) / 100;
  totalTva = Math.round(totalTva * 100) / 100;
  return { totalHt, totalTva, totalTtc: Math.round((totalHt + totalTva) * 100) / 100 };
}

// Texte légal par défaut, éditable, préchargé à la création des
// paramètres de facturation — reprend le taux supplétif légal (BCE +10
// points, art. L441-10 Code de commerce) et l'indemnité forfaitaire de
// 40€/facture (art. D441-5), recherche réglementaire menée le
// 13/07/2026. À faire relire par un expert-comptable avant tout usage
// réel (le texte engage juridiquement le vendeur) — voir mémoire
// projet.
export const MENTION_PENALITES_RETARD_DEFAUT =
  "En cas de retard de paiement, une pénalité au taux d'intérêt de la Banque centrale européenne majoré de 10 points sera appliquée, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40 €, due de plein droit sans mise en demeure préalable (art. L441-10 et D441-5 du Code de commerce). Pas d'escompte pour paiement anticipé.";

export type ProfilClient = "particulier" | "professionnel" | "chr";

// Tarification multi-profil : retombe sur prix_vente_defaut si aucun
// prix spécifique au profil n'est renseigné pour ce produit — jamais
// null/bloquant, juste une suggestion que l'utilisateur reste libre de
// corriger ligne par ligne.
export function resoudrePrixLigne(
  produit: { prix_particulier: number | null; prix_professionnel: number | null; prix_chr: number | null; prix_vente_defaut: number | null },
  profil: ProfilClient
): number | null {
  const parProfil = { particulier: produit.prix_particulier, professionnel: produit.prix_professionnel, chr: produit.prix_chr }[profil];
  return parProfil ?? produit.prix_vente_defaut;
}
