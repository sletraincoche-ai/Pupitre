import "server-only";

// Constantes et règles du format DTI+ viticole (v18, XSD 1.0.14,
// docs/dti-plus/) — centralisées ici pour être partagées entre les
// routes API (validation) et le générateur d'export (lib/cave-export.ts).

// centilisationType du XSD — valeur en centilitres de chaque format,
// AUTRE excepté (utilise volume_personnalise, en cL également).
export const CENTILISATION_CL: Record<string, number | null> = {
  CL_10: 10, CL_12_5: 12.5, CL_18_7: 18.7, CL_20: 20, CL_25: 25, CL_35: 35,
  CL_37_5: 37.5, CL_50: 50, CL_62: 62, CL_70: 70, CL_75: 75, CL_100: 100,
  CL_150: 150, CL_175: 175, CL_200: 200,
  BIB_225: 225, BIB_300: 300, BIB_400: 400, BIB_500: 500, BIB_800: 800, BIB_1000: 1000,
  AUTRE: null,
};

// 1 hL = 10 000 cL (VolumeType/VolumeStockType du XSD : décimal 5
// décimales) — même formule que l'ancien lib/cave.ts (HL_PAR_BOUTEILLE),
// généralisée à un format de bouteille variable.
export function bouteillesVersHl(quantiteBouteilles: number, contenance: string, volumePersonnalise?: number | null): number {
  const cl = contenance === "AUTRE" ? (volumePersonnalise ?? 0) : (CENTILISATION_CL[contenance] ?? 0);
  return (quantiteBouteilles * cl) / 10000;
}

export type TypeMouvement =
  | "tirage"
  | "degorgement"
  | "vente_comptoir"
  | "vente_client"
  | "export"
  | "perte"
  | "entree_acquitte";

export type MappingDti = {
  regime: "suspendu" | "acquitte";
  sens: "entree" | "sortie";
  // Champ DTI+ exact où compter le volume de ce mouvement — null pour un
  // mouvement qui n'impacte aucune balance de volume (dégorgement : le
  // vin reste physiquement en cave, seule une capsule CRD est consommée).
  champDti: string | null;
  // RG17-19/RG43-44 du XSD : observation obligatoire quand le champ est
  // une case "autres-*"/"replacements".
  observationObligatoire: boolean;
};

// HYPOTHÈSE V1 (voir supabase/schema.sql en tête de section Cave, et la
// mémoire projet_pupitre_cave) : domaine opérant exclusivement via
// capsules CRD personnalisées — tout le cycle reste en droits-suspendus,
// le droit étant sécurisé par la capsule posée au dégorgement. À
// reconsidérer si le domaine confirme opérer aussi en droits acquittés
// traditionnels.
export const MAPPING_MOUVEMENT_DTI: Record<TypeMouvement, MappingDti> = {
  tirage: { regime: "suspendu", sens: "entree", champDti: "volume-produit", observationObligatoire: false },
  degorgement: { regime: "suspendu", sens: "entree", champDti: null, observationObligatoire: false },
  vente_comptoir: { regime: "suspendu", sens: "sortie", champDti: "ventes-france-crd-suspendus", observationObligatoire: false },
  vente_client: { regime: "suspendu", sens: "sortie", champDti: "ventes-france-crd-suspendus", observationObligatoire: false },
  export: { regime: "suspendu", sens: "sortie", champDti: "ventes-france-crd-suspendus", observationObligatoire: false },
  perte: { regime: "suspendu", sens: "sortie", champDti: "autres-sorties", observationObligatoire: true },
  entree_acquitte: { regime: "acquitte", sens: "entree", champDti: "achats", observationObligatoire: false },
};

export const LIBELLES_FISCAUX_CHAMPAGNE = ["VM_IG_AOP", "VM_IG_IGP"] as const;
