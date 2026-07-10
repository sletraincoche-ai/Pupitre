// Le registre unifié des "fiches" du Studio — chaque email ou réponse
// d'avis produit par le Studio est une fiche numérotée, comme une fiche
// technique de dégustation. Volontairement séparé des files d'attente de
// chaque atelier (emailCampagnes, avisGoogle) : ces files restent la
// source de vérité pour ce qui reste à valider, tandis que ce fichier
// ajoute l'historique déjà résolu pour que l'écran d'accueil du Studio ait
// un registre réaliste — sans risquer de faire fuiter ces entrées déjà
// traitées dans les files des ateliers.
//
// Les publications Réseaux sociaux ne font plus partie de ce registre :
// elles sont des données réelles rattachées au compte connecté (voir
// lib/publications.ts et /api/studio/publications), pas de la simulation.

import {
  emailCampagnes,
  avisGoogle,
  AUJOURDHUI,
} from "@/lib/mock-data";

export type StatutFiche = "En attente" | "Publiée" | "Envoyée";
export type CanalFiche = "Instagram" | "Facebook" | "Email" | "Avis Google";

export type Fiche = {
  id?: string;
  numero: string;
  date: string;
  canal: CanalFiche;
  statut: StatutFiche;
  apercu: string;
  origine: string;
  lien: string;
};

// "Déclenché par la Cave — X" -> "Origine : la Cave — X". Un seul format
// factuel et sobre, réutilisé par le registre et par chaque atelier.
export function formatOrigine(declencheur?: string): string {
  if (!declencheur) return "Origine : création manuelle";
  return `Origine : ${declencheur.replace(/^Déclenché par /, "")}`;
}

const moisFr: Record<string, number> = {
  janvier: 1, février: 2, mars: 3, avril: 4, mai: 5, juin: 6,
  juillet: 7, août: 8, septembre: 9, octobre: 10, novembre: 11, décembre: 12,
};

export function ficheEstCeMois(f: Fiche): boolean {
  const mois = moisFr[f.date.split(" ")[1]] ?? 0;
  return mois === AUJOURDHUI.getMonth() + 1;
}

function cleDate(date: string): number {
  const parts = date.split(" ");
  const jour = Number(parts[0]);
  const mois = moisFr[parts[1]] ?? 1;
  const annee = parts[2] ? Number(parts[2]) : AUJOURDHUI.getFullYear();
  return annee * 10000 + mois * 100 + jour;
}

// Historique déjà résolu — pas de déclencheur inventé sans lien : chaque
// origine reprend un fait déjà établi ailleurs dans les données mockées
// (Cave, Agenda, Clients, avis reçus).
const fichesHistoriques: Omit<Fiche, "numero">[] = [
  {
    date: "30 juin",
    canal: "Email",
    statut: "Envoyée",
    apercu: "Objet : Votre récolte 2025 arrive en cave — Segment : Clients Fidèles, 42 contacts",
    origine: "Origine : Cave — Mise en cave du Millésime 2025",
    lien: "/dashboard/studio/mail",
  },
  {
    date: "1 juillet",
    canal: "Avis Google",
    statut: "Publiée",
    apercu: "Réponse à Yuki Tanaka (5★) : Merci infiniment pour ce si beau message...",
    origine: "Origine : 1 avis reçu, 30 juin",
    lien: "/dashboard/studio/avis",
  },
  {
    date: "2 juillet",
    canal: "Email",
    statut: "Envoyée",
    apercu: "Objet : Merci pour votre visite — Segment : Visiteurs de la semaine, 8 contacts",
    origine: "Origine : Visites — 8 groupes reçus la semaine du 22 juin",
    lien: "/dashboard/studio/mail",
  },
];

function apercuEmail(e: (typeof emailCampagnes)[number]): string {
  return `Objet : ${e.objet} — Segment : ${e.segment}, ${e.nombreDestinataires} contacts`;
}

function apercuAvis(a: (typeof avisGoogle)[number]): string {
  const reponse = a.reponseProposee;
  return `Réponse à ${a.auteur} (${"★".repeat(a.note)}) : ${reponse.length > 70 ? `${reponse.slice(0, 70)}…` : reponse}`;
}

export function getFiches(): Fiche[] {
  const vivantes: Omit<Fiche, "numero">[] = [
    ...emailCampagnes.map((e) => ({
      id: e.id,
      date: e.date,
      canal: "Email" as CanalFiche,
      statut: e.statut === "Brouillon" ? ("En attente" as StatutFiche) : (e.statut as StatutFiche),
      apercu: apercuEmail(e),
      origine: formatOrigine(e.declencheur),
      lien: "/dashboard/studio/mail",
    })),
    ...avisGoogle.map((a) => ({
      id: a.id,
      date: a.date,
      canal: "Avis Google" as CanalFiche,
      statut: a.statut as StatutFiche,
      apercu: apercuAvis(a),
      origine: `Origine : avis reçu, ${a.date}`,
      lien: "/dashboard/studio/avis",
    })),
  ];

  const toutes = [...fichesHistoriques, ...vivantes].sort((a, b) => cleDate(a.date) - cleDate(b.date));

  return toutes.map((f, i) => ({ ...f, numero: String(i + 1).padStart(3, "0") }));
}

let numerosParId: Map<string, string> | null = null;

// Fait correspondre le numéro de fiche affiché sur l'accueil du Studio à
// l'élément d'une file d'atelier — même référence des deux côtés.
export function getNumeroParId(id: string): string | undefined {
  if (!numerosParId) {
    numerosParId = new Map(getFiches().filter((f) => f.id).map((f) => [f.id as string, f.numero]));
  }
  return numerosParId.get(id);
}
