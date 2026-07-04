import {
  AUJOURDHUI,
  calendrierJuillet,
  visites,
  type Visite,
  type ContenuStudio,
} from "@/lib/mock-data";
import { moisADeclarer, moisLabel, toDateKey } from "@/lib/cave";

export type AgendaCategorie =
  | "reglementaire"
  | "cave"
  | "visites"
  | "publications"
  | "personnel";

export const categorieColors: Record<AgendaCategorie, string> = {
  reglementaire: "#A3402E", // rouge
  cave: "#2E4B3C", // vert (vine)
  visites: "#B8933E", // or (gold)
  publications: "#6B6459", // gris (stone)
  personnel: "#5C7A99", // bleu discret, pas un bleu Bootstrap
};

export const categorieLabels: Record<AgendaCategorie, string> = {
  reglementaire: "Réglementaire",
  cave: "Cave et vigne",
  visites: "Visites",
  publications: "Publications",
  personnel: "Personnel",
};

type BaseEvent = { id: string; date: string; heure?: string };

export type EvenementReglementaire = BaseEvent & {
  categorie: "reglementaire";
  titre: string;
  description: string;
};

export type EvenementCave = BaseEvent & {
  categorie: "cave";
  titre: string;
  description: string;
};

export type EvenementVisite = BaseEvent & {
  categorie: "visites";
  visite: Visite;
};

export type EvenementPublication = BaseEvent & {
  categorie: "publications";
  titre: string;
  plateforme: ContenuStudio["plateforme"];
};

export type EvenementPersonnel = BaseEvent & {
  categorie: "personnel";
  titre: string;
  note?: string;
};

export type AgendaEvent =
  | EvenementReglementaire
  | EvenementCave
  | EvenementVisite
  | EvenementPublication
  | EvenementPersonnel;

const moisFr: Record<string, string> = {
  janvier: "01",
  février: "02",
  mars: "03",
  avril: "04",
  mai: "05",
  juin: "06",
  juillet: "07",
  août: "08",
  septembre: "09",
  octobre: "10",
  novembre: "11",
  décembre: "12",
};

// "14 juillet 2026" -> "2026-07-14"
export function parseDateFr(date: string): string {
  const [jour, mois, annee] = date.split(" ");
  return `${annee}-${moisFr[mois] ?? "01"}-${jour.padStart(2, "0")}`;
}

const evenementsReglementaires: EvenementReglementaire[] = [
  {
    id: "reg-drm",
    date: toDateKey(new Date(AUJOURDHUI.getFullYear(), AUJOURDHUI.getMonth(), 10)),
    categorie: "reglementaire",
    titre: `DRM ${moisLabel(moisADeclarer())} à déposer sur CIEL`,
    description:
      "Le récapitulatif est prêt dans la Cave. À recopier manuellement avant le 10.",
  },
  {
    id: "reg-civc",
    date: "2026-07-15",
    categorie: "reglementaire",
    titre: "Déclaration CIVC trimestrielle",
    description: "Cotisations interprofessionnelles du 2ᵉ trimestre.",
  },
  {
    id: "reg-dai",
    date: "2026-08-05",
    categorie: "reglementaire",
    titre: "DAI — Déclaration d'intention de récolte",
    description: "Déclaration d'intention à transmettre avant les vendanges.",
  },
];

const evenementsCave: EvenementCave[] = [
  {
    id: "cave-effeuillage",
    date: "2026-07-08",
    categorie: "cave",
    titre: "Effeuillage suggéré",
    description: "Par analogie avec 2025 à la même période sur les parcelles de Chardonnay.",
  },
  {
    id: "cave-traitement",
    date: "2026-07-14",
    categorie: "cave",
    titre: "Traitement anti-mildiou suggéré",
    description: "Fenêtre météo favorable identifiée d'après l'historique du domaine.",
  },
  {
    id: "cave-vendanges",
    date: "2026-09-07",
    categorie: "cave",
    titre: "Vendanges prévisionnelles (estimation)",
    description: "Date estimée par analogie avec les millésimes précédents.",
  },
];

function visitesEnEvenements(): EvenementVisite[] {
  return visites.map((v) => ({
    id: `visite-${v.id}`,
    date: parseDateFr(v.date),
    heure: v.heure.replace("h", ":").padEnd(5, "0"),
    categorie: "visites",
    visite: v,
  }));
}

function publicationsEnEvenements(): EvenementPublication[] {
  return calendrierJuillet.map((c) => ({
    id: `pub-${c.jour}-${c.plateforme}`,
    date: `2026-07-${String(c.jour).padStart(2, "0")}`,
    categorie: "publications",
    titre: c.titre,
    plateforme: c.plateforme,
  }));
}

export function getTousLesEvenements(
  personnels: EvenementPersonnel[]
): AgendaEvent[] {
  return [
    ...evenementsReglementaires,
    ...evenementsCave,
    ...visitesEnEvenements(),
    ...publicationsEnEvenements(),
    ...personnels,
  ];
}

export const evenementsPersonnelsInitiaux: EvenementPersonnel[] = [
  {
    id: "perso-1",
    date: "2026-07-09",
    heure: "11:00",
    categorie: "personnel",
    titre: "RDV fournisseur bouchons",
    note: "Renégociation tarifs 2027.",
  },
  {
    id: "perso-2",
    date: "2026-07-17",
    heure: "14:30",
    categorie: "personnel",
    titre: "Rendez-vous banque",
    note: "Point sur le financement de la nouvelle presse.",
  },
  {
    id: "perso-3",
    date: "2026-07-21",
    categorie: "personnel",
    titre: "Salon Vinexpo Paris",
    note: "Déplacement sur 2 jours.",
  },
];
