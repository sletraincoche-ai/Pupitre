import { AUJOURDHUI, numeroAccise, type Cuvee, type Mouvement } from "@/lib/mock-data";

const HL_PAR_BOUTEILLE = 0.75 / 100; // 1 bouteille = 0,75 L = 0,0075 hL

// Formate une Date en "AAAA-MM-JJ" en heure locale (jamais via toISOString,
// qui convertit en UTC et peut décaler la date d'un jour selon le fuseau).
export function toDateKey(date: Date): string {
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  const jour = String(date.getDate()).padStart(2, "0");
  return `${annee}-${mois}-${jour}`;
}

export function moisKey(date: string): string {
  return date.slice(0, 7); // "2026-06-15" -> "2026-06"
}

export function moisLabel(cle: string): string {
  const [annee, mois] = cle.split("-").map(Number);
  const label = new Date(annee, mois - 1, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function getMoisDisponibles(mouvements: Mouvement[]): string[] {
  const cles = new Set(mouvements.map((m) => moisKey(m.date)));
  return Array.from(cles).sort().reverse();
}

export function getMouvementsDuMois(mouvements: Mouvement[], cle: string): Mouvement[] {
  return mouvements.filter((m) => moisKey(m.date) === cle);
}

export function getMouvementsTries(mouvements: Mouvement[]): Mouvement[] {
  return [...mouvements].sort((a, b) =>
    `${b.date}T${b.heure}`.localeCompare(`${a.date}T${a.heure}`)
  );
}

// Mois actuellement en cours de déclaration (le mois précédant "aujourd'hui").
export function moisADeclarer(): string {
  const annee = AUJOURDHUI.getFullYear();
  const mois = AUJOURDHUI.getMonth(); // 0-indexé, donc déjà "mois - 1"
  const date = new Date(annee, mois - 1, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getJoursAvantEcheance(): number {
  const echeance = new Date(AUJOURDHUI.getFullYear(), AUJOURDHUI.getMonth(), 10);
  const diffMs = echeance.getTime() - AUJOURDHUI.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

// Cumul physique (entrées - sorties - pertes) d'une cuvée entre son stock
// initial (1er juin 2026) et une date bornée exclusive (AAAA-MM-JJ).
function stockPhysiqueAvant(
  cuvees: Cuvee[],
  mouvements: Mouvement[],
  cuveeId: string,
  dateLimiteExclusive: string
): number {
  const cuvee = cuvees.find((c) => c.id === cuveeId);
  if (!cuvee) return 0;
  return mouvements
    .filter((m) => m.cuveeId === cuveeId && m.date < dateLimiteExclusive)
    .reduce((total, m) => {
      if (m.type === "entree") return total + m.quantite;
      return total - m.quantite; // sortie ou perte
    }, cuvee.stockInitial);
}

export type StockCuveeCalcule = {
  cuvee: Cuvee;
  disponiblePhysique: number;
  disponibleCommercial: number;
  rythmeMensuel: number;
  ecoulementMois: number | null; // null = pas de rythme de vente ce mois-ci
  statut: "rouge" | "or" | "vert";
  surstock: boolean;
};

const SEUIL_ALERTE = 2;
const SEUIL_SURVEILLANCE = 6;
const SEUIL_SURSTOCK = 15;

export function getStockCalcule(
  cuvees: Cuvee[],
  mouvements: Mouvement[]
): StockCuveeCalcule[] {
  const moisReference = moisADeclarer();
  const lendemainAujourdhui = new Date(AUJOURDHUI);
  lendemainAujourdhui.setDate(lendemainAujourdhui.getDate() + 1);
  const dateLimite = toDateKey(lendemainAujourdhui);
  const mouvementsDuMoisReference = getMouvementsDuMois(mouvements, moisReference);

  return cuvees.map((cuvee) => {
    const disponiblePhysique = stockPhysiqueAvant(cuvees, mouvements, cuvee.id, dateLimite);
    const disponibleCommercial = disponiblePhysique - cuvee.reserve - cuvee.alloue;

    const rythmeMensuel = mouvementsDuMoisReference
      .filter((m) => m.cuveeId === cuvee.id && m.type === "sortie")
      .reduce((total, m) => total + m.quantite, 0);

    const ecoulementMois = rythmeMensuel > 0 ? disponibleCommercial / rythmeMensuel : null;

    let statut: StockCuveeCalcule["statut"] = "vert";
    if (ecoulementMois !== null) {
      if (ecoulementMois < SEUIL_ALERTE) statut = "rouge";
      else if (ecoulementMois < SEUIL_SURVEILLANCE) statut = "or";
    }
    const surstock = ecoulementMois !== null && ecoulementMois > SEUIL_SURSTOCK;

    return {
      cuvee,
      disponiblePhysique,
      disponibleCommercial,
      rythmeMensuel,
      ecoulementMois,
      statut,
      surstock,
    };
  });
}

export function getVentesComptoirDuMois(mouvements: Mouvement[], cle: string) {
  const rows = getMouvementsDuMois(mouvements, cle).filter(
    (m) => m.type === "sortie" && m.origine === "Vente comptoir"
  );
  const montant = rows.reduce(
    (total, m) => total + m.quantite * (m.prixUnitaire ?? 0),
    0
  );
  return { nombre: rows.length, montant };
}

export type DrmData = {
  moisLabel: string;
  numeroAccise: string;
  stockDebutHL: number;
  stockFinHL: number;
  entreesHL: number;
  sortiesFranceHL: number;
  exportHL: number;
  pertesHL: number;
  nombreMouvements: number;
};

export function getDrmData(cuvees: Cuvee[], mouvements: Mouvement[], cle: string): DrmData {
  const [annee, mois] = cle.split("-").map(Number);
  const debutMois = `${cle}-01`;
  const finMoisDate = new Date(annee, mois, 1); // 1er du mois suivant
  const finMois = toDateKey(finMoisDate);

  const bouteillesAvant = (dateLimite: string) =>
    cuvees.reduce(
      (total, c) => total + stockPhysiqueAvant(cuvees, mouvements, c.id, dateLimite),
      0
    );

  const stockDebut = bouteillesAvant(debutMois);
  const stockFin = bouteillesAvant(finMois);

  const mouvementsDuMois = getMouvementsDuMois(mouvements, cle);
  const entrees = mouvementsDuMois
    .filter((m) => m.type === "entree")
    .reduce((total, m) => total + m.quantite, 0);
  const exportBouteilles = mouvementsDuMois
    .filter((m) => m.type === "sortie" && m.origine === "Export")
    .reduce((total, m) => total + m.quantite, 0);
  const sortiesFrance = mouvementsDuMois
    .filter((m) => m.type === "sortie" && m.origine !== "Export")
    .reduce((total, m) => total + m.quantite, 0);
  const pertes = mouvementsDuMois
    .filter((m) => m.type === "perte")
    .reduce((total, m) => total + m.quantite, 0);

  return {
    moisLabel: moisLabel(cle),
    numeroAccise,
    stockDebutHL: stockDebut * HL_PAR_BOUTEILLE,
    stockFinHL: stockFin * HL_PAR_BOUTEILLE,
    entreesHL: entrees * HL_PAR_BOUTEILLE,
    sortiesFranceHL: sortiesFrance * HL_PAR_BOUTEILLE,
    exportHL: exportBouteilles * HL_PAR_BOUTEILLE,
    pertesHL: pertes * HL_PAR_BOUTEILLE,
    nombreMouvements: mouvementsDuMois.length,
  };
}
