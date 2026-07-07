// Le registre unifié des "fiches" du Studio — chaque publication, email
// ou réponse d'avis produit par le Studio est une fiche numérotée, comme
// une fiche technique de dégustation. Volontairement séparé des files
// d'attente de chaque atelier (publicationsSociales, emailCampagnes,
// avisGoogle) : ces files restent la source de vérité pour ce qui reste
// à valider, tandis que ce fichier ajoute l'historique déjà résolu pour
// que l'écran d'accueil du Studio ait un registre réaliste — sans risquer
// de faire fuiter ces entrées déjà traitées dans les files des ateliers.

import {
  publicationsSociales,
  emailCampagnes,
  avisGoogle,
  AUJOURDHUI,
} from "@/lib/mock-data";

export type StatutFiche = "En attente" | "Publiée" | "Envoyée";
export type CanalFiche = "Instagram" | "Facebook" | "Email" | "Avis Google";

export type Fiche = {
  numero: string;
  date: string;
  canal: CanalFiche;
  statut: StatutFiche;
  apercu: string;
  origine: string;
  lien: string;
};

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
    date: "28 juin",
    canal: "Instagram",
    statut: "Publiée",
    apercu: "Portes ouvertes ce week-end : venez découvrir le Rosé de Saignée en avant-première...",
    origine: "Origine : Agenda — Journée portes ouvertes du 28 juin",
    lien: "/dashboard/studio/reseaux-sociaux",
  },
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
    date: "1 juillet",
    canal: "Facebook",
    statut: "Publiée",
    apercu: "Le tri de la vendange 2025 racontée en images — merci à toute l'équipe de saisonniers...",
    origine: "Origine : 6 photos ajoutées à la Galerie, 30 juin",
    lien: "/dashboard/studio/reseaux-sociaux",
  },
  {
    date: "2 juillet",
    canal: "Instagram",
    statut: "Publiée",
    apercu: "Le Blanc de Blancs n'a plus que 3 semaines de stock devant lui — dernières bouteilles...",
    origine: "Origine : Cave — Blanc de Blancs en alerte stock (0,9 mois)",
    lien: "/dashboard/studio/reseaux-sociaux",
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

function apercuPublication(p: (typeof publicationsSociales)[number]): string {
  return p.legende.length > 90 ? `${p.legende.slice(0, 90)}…` : p.legende;
}

function apercuEmail(e: (typeof emailCampagnes)[number]): string {
  return `Objet : ${e.objet} — Segment : ${e.segment}, ${e.nombreDestinataires} contacts`;
}

function apercuAvis(a: (typeof avisGoogle)[number]): string {
  const reponse = a.reponseProposee;
  return `Réponse à ${a.auteur} (${"★".repeat(a.note)}) : ${reponse.length > 70 ? `${reponse.slice(0, 70)}…` : reponse}`;
}

export function getFiches(): Fiche[] {
  const vivantes: Omit<Fiche, "numero">[] = [
    ...publicationsSociales.map((p) => ({
      date: p.date,
      canal: p.plateforme,
      statut: p.statut === "Brouillon" ? ("En attente" as StatutFiche) : (p.statut as StatutFiche),
      apercu: apercuPublication(p),
      origine: p.declencheur ?? "Origine : création manuelle",
      lien: "/dashboard/studio/reseaux-sociaux",
    })),
    ...emailCampagnes.map((e) => ({
      date: e.date,
      canal: "Email" as CanalFiche,
      statut: e.statut === "Brouillon" ? ("En attente" as StatutFiche) : (e.statut as StatutFiche),
      apercu: apercuEmail(e),
      origine: e.declencheur ?? "Origine : création manuelle",
      lien: "/dashboard/studio/mail",
    })),
    ...avisGoogle.map((a) => ({
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
