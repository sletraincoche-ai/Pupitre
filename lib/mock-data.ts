// Données mockées pour Pupitre — aucune connexion backend réelle.

export type ClientTag = "fidele" | "dormant" | "etranger" | "pro";

export type Client = {
  id: string;
  nom: string;
  initiales: string;
  pays: string;
  drapeau: string;
  email: string;
  origine:
    | "Visite au domaine"
    | "Salon professionnel"
    | "Bouche-à-oreille"
    | "Agent export"
    | "Réseaux sociaux"
    | "Site web";
  segment: "Fidèle" | "Dormant" | "Étranger" | "Professionnel" | "Nouveau";
  tags: ClientTag[];
  totalAchats: number;
  derniereCommande: string;
  statut: "Actif" | "À relancer" | "VIP";
};

export const clients: Client[] = [
  {
    id: "c1",
    nom: "Isabelle Fontaine",
    initiales: "IF",
    pays: "France",
    drapeau: "🇫🇷",
    email: "isabelle.fontaine@mail.fr",
    origine: "Visite au domaine",
    segment: "Fidèle",
    tags: ["fidele"],
    totalAchats: 4820,
    derniereCommande: "12 juin 2026",
    statut: "VIP",
  },
  {
    id: "c2",
    nom: "James Whitmore",
    initiales: "JW",
    pays: "Royaume-Uni",
    drapeau: "🇬🇧",
    email: "j.whitmore@londonwine.co.uk",
    origine: "Agent export",
    segment: "Étranger",
    tags: ["etranger", "pro"],
    totalAchats: 12400,
    derniereCommande: "28 mai 2026",
    statut: "Actif",
  },
  {
    id: "c3",
    nom: "Haruto Sinclair",
    initiales: "HS",
    pays: "Japon",
    drapeau: "🇯🇵",
    email: "haruto.sinclair@tokyocellars.jp",
    origine: "Salon professionnel",
    segment: "Étranger",
    tags: ["etranger"],
    totalAchats: 2100,
    derniereCommande: "3 mars 2026",
    statut: "À relancer",
  },
  {
    id: "c4",
    nom: "Marc Delacroix",
    initiales: "MD",
    pays: "France",
    drapeau: "🇫🇷",
    email: "marc.delacroix@gmail.com",
    origine: "Bouche-à-oreille",
    segment: "Dormant",
    tags: ["dormant"],
    totalAchats: 640,
    derniereCommande: "14 novembre 2025",
    statut: "À relancer",
  },
  {
    id: "c5",
    nom: "Restaurant Le Clos Doré",
    initiales: "LC",
    pays: "France",
    drapeau: "🇫🇷",
    email: "contact@leclosdore.fr",
    origine: "Salon professionnel",
    segment: "Professionnel",
    tags: ["pro", "fidele"],
    totalAchats: 28900,
    derniereCommande: "30 juin 2026",
    statut: "VIP",
  },
  {
    id: "c6",
    nom: "Sofia Bergqvist",
    initiales: "SB",
    pays: "Suède",
    drapeau: "🇸🇪",
    email: "sofia.b@stockholmwine.se",
    origine: "Réseaux sociaux",
    segment: "Étranger",
    tags: ["etranger"],
    totalAchats: 1580,
    derniereCommande: "22 juin 2026",
    statut: "Actif",
  },
  {
    id: "c7",
    nom: "Antoine Rousseau",
    initiales: "AR",
    pays: "France",
    drapeau: "🇫🇷",
    email: "a.rousseau@orange.fr",
    origine: "Visite au domaine",
    segment: "Dormant",
    tags: ["dormant"],
    totalAchats: 310,
    derniereCommande: "2 septembre 2025",
    statut: "À relancer",
  },
  {
    id: "c8",
    nom: "Épicerie Fine Bacchus",
    initiales: "EB",
    pays: "Belgique",
    drapeau: "🇧🇪",
    email: "commandes@bacchus-epicerie.be",
    origine: "Agent export",
    segment: "Professionnel",
    tags: ["pro", "etranger"],
    totalAchats: 9350,
    derniereCommande: "18 juin 2026",
    statut: "Actif",
  },
  {
    id: "c9",
    nom: "Claire Vasseur",
    initiales: "CV",
    pays: "France",
    drapeau: "🇫🇷",
    email: "claire.vasseur@mail.fr",
    origine: "Site web",
    segment: "Fidèle",
    tags: ["fidele"],
    totalAchats: 3760,
    derniereCommande: "25 juin 2026",
    statut: "Actif",
  },
  {
    id: "c10",
    nom: "David Okafor",
    initiales: "DO",
    pays: "États-Unis",
    drapeau: "🇺🇸",
    email: "d.okafor@finewines.us",
    origine: "Salon professionnel",
    segment: "Étranger",
    tags: ["etranger", "pro"],
    totalAchats: 17600,
    derniereCommande: "9 juin 2026",
    statut: "VIP",
  },
  {
    id: "c11",
    nom: "Nadine Berthier",
    initiales: "NB",
    pays: "France",
    drapeau: "🇫🇷",
    email: "nadine.berthier@mail.fr",
    origine: "Réseaux sociaux",
    segment: "Dormant",
    tags: ["dormant"],
    totalAchats: 890,
    derniereCommande: "5 janvier 2026",
    statut: "À relancer",
  },
  {
    id: "c12",
    nom: "Château Montfleur — Hôtellerie",
    initiales: "CM",
    pays: "France",
    drapeau: "🇫🇷",
    email: "achats@chateau-montfleur.fr",
    origine: "Site web",
    segment: "Professionnel",
    tags: ["pro"],
    totalAchats: 15200,
    derniereCommande: "27 juin 2026",
    statut: "Actif",
  },
];

// KPI à delta simple (CA, bouteilles) — les KPI "Visites planifiées" et
// "Clients actifs" du tableau de bord sont calculés depuis `visites` et
// `clients` directement dans KpiCards, pas stockés ici.
export const kpis = [
  {
    id: "ca",
    label: "Chiffre d'affaires",
    value: "312 400 €",
    delta: "+8,4%",
    trend: "up" as const,
    good: true,
  },
  {
    id: "bouteilles",
    label: "Bouteilles vendues",
    value: "18 260",
    delta: "+3,1%",
    trend: "up" as const,
    good: true,
  },
];

// Total de clients actifs et de dormants à l'échelle du domaine (cohérent
// avec la maquette de la landing page) — plus grand que l'échantillon
// visible dans le tableau CRM, qui n'en illustre qu'une partie.
export const clientsActifsTotal = 684;
export const clientsDormantsTotal = 37;

export const ventesMensuelles = [
  { mois: "Août", valeur: 210 },
  { mois: "Sept", valeur: 245 },
  { mois: "Oct", valeur: 268 },
  { mois: "Nov", valeur: 302 },
  { mois: "Déc", valeur: 398 },
  { mois: "Jan", valeur: 180 },
  { mois: "Fév", valeur: 192 },
  { mois: "Mars", valeur: 224 },
  { mois: "Avr", valeur: 251 },
  { mois: "Mai", valeur: 279 },
  { mois: "Juin", valeur: 296 },
  { mois: "Juil", valeur: 312 },
];

// Campagnes marketing marquantes, en surimpression optionnelle du graphique.
export const campagnesMarketing = [
  { mois: "Déc", nom: "Newsletter Noël" },
  { mois: "Avr", nom: "Post Pâques" },
];

export type ActiviteType = "reservation" | "vente" | "contenu" | "avis" | "systeme";

export const activites: { id: string; type: ActiviteType; texte: string; temps: string }[] = [
  {
    id: "a1",
    type: "reservation",
    texte: "Groupe belge (8 pers.) confirmé pour samedi",
    temps: "Il y a 20 min",
  },
  {
    id: "a2",
    type: "vente",
    texte: "M. Hartmann a commandé 6 bouteilles",
    temps: "Il y a 47 min",
  },
  {
    id: "a3",
    type: "contenu",
    texte: "Post Instagram sur les vendanges proposé",
    temps: "Il y a 1 h",
  },
  {
    id: "a4",
    type: "avis",
    texte: "Nouvel avis 5 étoiles de Yuki Tanaka",
    temps: "Il y a 3 h",
  },
  {
    id: "a5",
    type: "vente",
    texte: "Commande export expédiée vers Sofia Bergqvist (Suède)",
    temps: "Il y a 5 h",
  },
  {
    id: "a6",
    type: "systeme",
    texte: "Commande n°247 marquée préparée",
    temps: "Hier à 18:22",
  },
];

// --- Cave : référentiel cuvées + registre des mouvements ---
// Le stock affiché dans toute l'app (dashboard, module Cave) est calculé
// depuis `cuvees` (solde d'ouverture + réservations/allocations) et
// `mouvements` (le registre) par les sélecteurs de /lib/cave.ts — jamais
// une valeur statique séparée.

// "Aujourd'hui" fictif de l'application, partagé par tous les calculs
// (jours avant échéance DRM, etc.).
export const AUJOURDHUI = new Date(2026, 6, 3);

export type Cuvee = {
  id: string;
  nom: string;
  millesime: string; // "NV" (non millésimé) ou année
  prixVenteDefaut: number;
  stockInitial: number; // bouteilles en cave au 1er juin 2026
  reserve: number; // commandes non livrées
  alloue: number; // engagé sur salons / export
};

export const cuvees: Cuvee[] = [
  {
    id: "cv1",
    nom: "Brut Réserve",
    millesime: "NV",
    prixVenteDefaut: 28,
    stockInitial: 4460,
    reserve: 120,
    alloue: 200,
  },
  {
    id: "cv2",
    nom: "Blanc de Blancs",
    millesime: "NV",
    prixVenteDefaut: 34,
    stockInitial: 430,
    reserve: 40,
    alloue: 250,
  },
  {
    id: "cv3",
    nom: "Rosé de Saignée",
    millesime: "NV",
    prixVenteDefaut: 32,
    stockInitial: 1350,
    reserve: 60,
    alloue: 90,
  },
  {
    id: "cv4",
    nom: "Millésime",
    millesime: "2016",
    prixVenteDefaut: 52,
    stockInitial: 950,
    reserve: 30,
    alloue: 50,
  },
  {
    id: "cv5",
    nom: "Extra-Brut Vigneron",
    millesime: "NV",
    prixVenteDefaut: 30,
    stockInitial: 700,
    reserve: 20,
    alloue: 350,
  },
];

export type MouvementType = "entree" | "sortie" | "perte";

export type Mouvement = {
  id: string;
  date: string; // AAAA-MM-JJ
  heure: string; // HH:mm
  type: MouvementType;
  cuveeId: string;
  quantite: number; // bouteilles
  origine: string;
  clientId?: string;
  clientNom?: string;
  prixUnitaire?: number;
  auteur: string;
};

export const mouvements: Mouvement[] = [
  { id: "m1", date: "2026-06-01", heure: "08:30", type: "entree", cuveeId: "cv1", quantite: 320, origine: "Dégorgement", auteur: "Antoine Vasseur" },
  { id: "m2", date: "2026-06-01", heure: "09:00", type: "entree", cuveeId: "cv3", quantite: 120, origine: "Dégorgement", auteur: "Antoine Vasseur" },
  { id: "m3", date: "2026-06-02", heure: "10:15", type: "entree", cuveeId: "cv5", quantite: 60, origine: "Dégorgement", auteur: "Antoine Vasseur" },
  { id: "m4", date: "2026-06-02", heure: "14:20", type: "sortie", cuveeId: "cv1", quantite: 6, origine: "Vente comptoir", prixUnitaire: 28, auteur: "Antoine Vasseur" },
  { id: "m5", date: "2026-06-03", heure: "11:00", type: "sortie", cuveeId: "cv2", quantite: 4, origine: "Vente comptoir", prixUnitaire: 34, auteur: "Antoine Vasseur" },
  { id: "m6", date: "2026-06-03", heure: "16:45", type: "sortie", cuveeId: "cv1", quantite: 48, origine: "Vente client", clientId: "c5", clientNom: "Restaurant Le Clos Doré", prixUnitaire: 26, auteur: "Antoine Vasseur" },
  { id: "m7", date: "2026-06-04", heure: "09:40", type: "sortie", cuveeId: "cv4", quantite: 6, origine: "Vente comptoir", prixUnitaire: 52, auteur: "Antoine Vasseur" },
  { id: "m8", date: "2026-06-05", heure: "13:10", type: "sortie", cuveeId: "cv3", quantite: 40, origine: "Vente client", clientId: "c12", clientNom: "Château Montfleur — Hôtellerie", prixUnitaire: 30, auteur: "Antoine Vasseur" },
  { id: "m9", date: "2026-06-06", heure: "10:30", type: "sortie", cuveeId: "cv1", quantite: 12, origine: "Vente comptoir", prixUnitaire: 28, auteur: "Louis Vasseur" },
  { id: "m10", date: "2026-06-07", heure: "15:00", type: "sortie", cuveeId: "cv2", quantite: 6, origine: "Vente comptoir", prixUnitaire: 34, auteur: "Antoine Vasseur" },
  { id: "m11", date: "2026-06-08", heure: "11:20", type: "sortie", cuveeId: "cv1", quantite: 100, origine: "Export", clientId: "c8", clientNom: "Épicerie Fine Bacchus", prixUnitaire: 24, auteur: "Antoine Vasseur" },
  { id: "m12", date: "2026-06-09", heure: "14:35", type: "sortie", cuveeId: "cv5", quantite: 35, origine: "Vente client", clientId: "c8", clientNom: "Épicerie Fine Bacchus", prixUnitaire: 27, auteur: "Antoine Vasseur" },
  { id: "m13", date: "2026-06-10", heure: "09:50", type: "sortie", cuveeId: "cv2", quantite: 40, origine: "Vente client", clientId: "c8", clientNom: "Épicerie Fine Bacchus", prixUnitaire: 30, auteur: "Antoine Vasseur" },
  { id: "m14", date: "2026-06-11", heure: "17:20", type: "sortie", cuveeId: "cv1", quantite: 8, origine: "Vente comptoir", prixUnitaire: 28, auteur: "Antoine Vasseur" },
  { id: "m15", date: "2026-06-12", heure: "10:05", type: "sortie", cuveeId: "cv1", quantite: 40, origine: "Salon", prixUnitaire: 25, auteur: "Antoine Vasseur" },
  { id: "m16", date: "2026-06-13", heure: "12:40", type: "sortie", cuveeId: "cv3", quantite: 15, origine: "Salon", prixUnitaire: 28, auteur: "Antoine Vasseur" },
  { id: "m17", date: "2026-06-14", heure: "16:10", type: "sortie", cuveeId: "cv4", quantite: 24, origine: "Vente client", clientId: "c10", clientNom: "David Okafor", prixUnitaire: 48, auteur: "Antoine Vasseur" },
  { id: "m18", date: "2026-06-15", heure: "09:25", type: "sortie", cuveeId: "cv1", quantite: 14, origine: "Vente comptoir", prixUnitaire: 28, auteur: "Antoine Vasseur" },
  { id: "m19", date: "2026-06-16", heure: "11:50", type: "sortie", cuveeId: "cv5", quantite: 20, origine: "Vente client", clientId: "c8", clientNom: "Épicerie Fine Bacchus", prixUnitaire: 27, auteur: "Antoine Vasseur" },
  { id: "m20", date: "2026-06-18", heure: "15:30", type: "sortie", cuveeId: "cv1", quantite: 60, origine: "Vente client", clientId: "c12", clientNom: "Château Montfleur — Hôtellerie", prixUnitaire: 25, auteur: "Antoine Vasseur" },
  { id: "m21", date: "2026-06-19", heure: "10:15", type: "perte", cuveeId: "cv2", quantite: 5, origine: "Casse", auteur: "Antoine Vasseur" },
  { id: "m22", date: "2026-06-20", heure: "14:00", type: "sortie", cuveeId: "cv1", quantite: 10, origine: "Vente comptoir", prixUnitaire: 28, auteur: "Antoine Vasseur" },
  { id: "m23", date: "2026-06-21", heure: "09:45", type: "sortie", cuveeId: "cv2", quantite: 20, origine: "Salon", prixUnitaire: 32, auteur: "Antoine Vasseur" },
  { id: "m24", date: "2026-06-22", heure: "11:30", type: "perte", cuveeId: "cv1", quantite: 10, origine: "Casse", auteur: "Antoine Vasseur" },
  { id: "m25", date: "2026-06-23", heure: "16:20", type: "sortie", cuveeId: "cv3", quantite: 30, origine: "Vente comptoir", prixUnitaire: 32, auteur: "Antoine Vasseur" },
  { id: "m26", date: "2026-06-25", heure: "10:40", type: "sortie", cuveeId: "cv1", quantite: 60, origine: "Vente comptoir", prixUnitaire: 28, auteur: "Antoine Vasseur" },
  { id: "m27", date: "2026-06-27", heure: "13:15", type: "sortie", cuveeId: "cv5", quantite: 10, origine: "Vente comptoir", prixUnitaire: 30, auteur: "Antoine Vasseur" },
  { id: "m28", date: "2026-06-28", heure: "09:30", type: "sortie", cuveeId: "cv1", quantite: 40, origine: "Vente comptoir", prixUnitaire: 28, auteur: "Antoine Vasseur" },
  { id: "m29", date: "2026-07-01", heure: "10:00", type: "sortie", cuveeId: "cv1", quantite: 8, origine: "Vente comptoir", prixUnitaire: 28, auteur: "Antoine Vasseur" },
  { id: "m30", date: "2026-07-02", heure: "14:30", type: "sortie", cuveeId: "cv2", quantite: 3, origine: "Vente comptoir", prixUnitaire: 34, auteur: "Antoine Vasseur" },
  { id: "m31", date: "2026-07-03", heure: "09:15", type: "entree", cuveeId: "cv1", quantite: 200, origine: "Dégorgement", auteur: "Antoine Vasseur" },
  { id: "m32", date: "2026-07-03", heure: "16:00", type: "sortie", cuveeId: "cv3", quantite: 12, origine: "Vente comptoir", prixUnitaire: 32, auteur: "Antoine Vasseur" },
];

export const drmHistorique = [
  { mois: "Mai 2026", preparéeLe: "6 juin 2026" },
  { mois: "Avril 2026", preparéeLe: "9 mai 2026" },
  { mois: "Mars 2026", preparéeLe: "7 avril 2026" },
];

export const numeroAccise = "51-00512-A";

export const briefHebdomadaire = [
  {
    id: "b1",
    titre: `Réactiver ${clientsDormantsTotal} clients dormants, email prêt`,
    description:
      "Segment identifié avec un dernier achat de plus de 18 mois. Une campagne e-mail ciblée est prête dans Studio.",
    priorite: "Élevé",
    action: "Envoyer les relances",
  },
  {
    id: "b2",
    titre: "Valider le post Instagram sur les vendanges",
    description:
      "Prévu pour le 5 juillet. Photo et légende générées à partir de la charte narrative du domaine.",
    priorite: "Élevé",
    action: "Ouvrir le Studio",
  },
  {
    id: "b3",
    titre: "Confirmer la visite de Sofia Bergqvist (19 juillet)",
    description:
      "Demande en attente depuis 3 jours. La confirmation déclenche l'email automatique au visiteur.",
    priorite: "Moyen",
    action: "Confirmer",
  },
];

export type ReseauPlateforme = "Instagram" | "Facebook";
export type FormatContenu = "post" | "story" | "carrousel";

export type PublicationSociale = {
  id: string;
  plateforme: ReseauPlateforme;
  format: FormatContenu;
  // Le fait réel, dans un autre module, qui a produit cette suggestion —
  // absent pour une création manuelle (mode 2.5).
  declencheur?: string;
  photos: string[]; // ids référençant photosDomaine
  legende: string;
  hashtags: string[];
  musique?: string;
  date: string;
  statut: "En attente" | "Brouillon";
};

export const publicationsSociales: PublicationSociale[] = [
  {
    id: "pub1",
    plateforme: "Instagram",
    format: "post",
    declencheur: "Déclenché par la Cave — Millésime 2016 en surstock (28 mois de stock)",
    photos: ["ph2"],
    legende:
      "Notre Millésime 2016 se révèle enfin 🥂 Une cuvée de caractère, en quantité limitée en cave. Une bouteille aujourd'hui, un souvenir demain.",
    hashtags: ["ChampagnePupitre", "Millesime2016"],
    date: "5 juillet",
    statut: "En attente",
  },
  {
    id: "pub2",
    plateforme: "Instagram",
    format: "story",
    declencheur: "Déclenché par l'Agenda — Vendanges prévisionnelles le 7 septembre",
    photos: ["ph1"],
    legende: "Les vendanges approchent 🍇 Rendez-vous début septembre !",
    hashtags: ["Vendanges2026"],
    musique: "Golden Hour — instrumental",
    date: "2 septembre",
    statut: "En attente",
  },
  {
    id: "pub3",
    plateforme: "Facebook",
    format: "post",
    declencheur: "Déclenché par Clients — segment Fidèles (3 clients)",
    photos: ["ph6"],
    legende:
      "Une pensée pour nos clients les plus fidèles, qui nous suivent depuis plusieurs millésimes. Merci pour votre confiance — la prochaine dégustation est pour vous.",
    hashtags: [],
    date: "10 juillet",
    statut: "En attente",
  },
];

export type EmailCampagne = {
  id: string;
  declencheur?: string;
  objet: string;
  corps: string;
  segment: string;
  nombreDestinataires: number;
  date: string;
  statut: "En attente" | "Brouillon";
};

export const emailCampagnes: EmailCampagne[] = [
  {
    id: "mail1",
    declencheur: "Déclenché par Clients — segment dormant (37 clients)",
    objet: "Cela fait un moment...",
    corps:
      "Cela fait un moment que nous ne vous avons pas servi. Nous aimerions vous retrouver au domaine ou dans votre cave : -10% sur votre prochaine commande jusqu'au 31 juillet.",
    segment: "Clients dormants",
    nombreDestinataires: clientsDormantsTotal,
    date: "7 juillet",
    statut: "En attente",
  },
  {
    id: "mail2",
    declencheur: "Déclenché par la Cave — Millésime 2016 en surstock (28 mois de stock)",
    objet: "Millésime 2016 — offre professionnels",
    corps:
      "Notre Millésime 2016 est disponible en quantité limitée à des conditions préférentielles pour nos partenaires professionnels. Contactez-nous avant fin juillet pour réserver vos volumes.",
    segment: "Clients Pros",
    nombreDestinataires: clients.filter((c) => c.tags.includes("pro")).length,
    date: "9 juillet",
    statut: "En attente",
  },
];

export type AvisGoogle = {
  id: string;
  auteur: string;
  note: number;
  langue: string;
  texte: string;
  reponseProposee: string;
  date: string;
  statut: "En attente" | "Publiée";
};

export const avisGoogle: AvisGoogle[] = [
  {
    id: "avis1",
    auteur: "Élodie R.",
    note: 5,
    langue: "Français",
    texte:
      "Accueil chaleureux, dégustation exceptionnelle et un rosé de saignée à tomber. On reviendra avec des amis !",
    reponseProposee:
      "Merci infiniment pour ce message, Élodie ! C'est un plaisir de vous avoir reçue au domaine. Nous avons hâte de vous faire découvrir notre prochaine cuvée. À très bientôt !",
    date: "9 juillet",
    statut: "En attente",
  },
  {
    id: "avis2",
    auteur: "Marc T.",
    note: 4,
    langue: "Français",
    texte:
      "Très belle visite, cave impressionnante. Un peu d'attente le samedi mais l'accueil valait le détour.",
    reponseProposee:
      "Merci Marc pour ce retour sincère ! Nous prenons note de l'attente du samedi et travaillons à mieux fluidifier l'accueil ce jour-là. Au plaisir de vous revoir.",
    date: "22 juillet",
    statut: "En attente",
  },
];

export const totalContenusStudioEnAttente =
  publicationsSociales.filter((p) => p.statut === "En attente").length +
  emailCampagnes.filter((e) => e.statut === "En attente").length +
  avisGoogle.filter((a) => a.statut === "En attente").length;

// Charte narrative produite par le test d'identité — null tant que le
// vigneron ne l'a pas encore fait. Les piliers d'histoires forment une
// liste append-only : le test initial pose les 3-4 premiers, puis chaque
// enrichissement (saison, nouvelle cuvée, anecdote de visite) en ajoute
// un nouveau, horodaté et tracé à son origine — jamais d'écrasement.
export type OrigineEnrichissement = "test" | "saison" | "cuvee" | "visite";

export type PilierHistoire = {
  id: string;
  texte: string;
  origine: OrigineEnrichissement;
  date: string;
};

export type CharteNarrative = {
  ton: string;
  piliers: PilierHistoire[];
  vocabulaire: string[];
  interdits: string[];
};

// Photos du domaine (6.3) — l'IA pioche dedans pour illustrer les posts,
// jamais dans une banque d'images générique.
export const photosDomaine = [
  { id: "ph1", legende: "Rangs de vigne au petit matin" },
  { id: "ph2", legende: "Cave et foudres de chêne" },
  { id: "ph3", legende: "Dégorgement à la volée" },
  { id: "ph4", legende: "Portrait au pressoir" },
  { id: "ph5", legende: "Étiquette Brut Réserve" },
  { id: "ph6", legende: "Accueil au caveau" },
];

export type PlateformePublicationCalendrier = "Instagram" | "Email" | "Avis Google";

export type EvenementCalendrier = {
  jour: number;
  titre: string;
  plateforme: PlateformePublicationCalendrier;
};

export const calendrierJuillet: EvenementCalendrier[] = [
  { jour: 2, titre: "Teaser vendanges", plateforme: "Instagram" },
  { jour: 5, titre: "Post grappes de juillet", plateforme: "Instagram" },
  { jour: 7, titre: "Millésime 2016", plateforme: "Email" },
  { jour: 9, titre: "Réponse avis Élodie R.", plateforme: "Avis Google" },
  { jour: 12, titre: "Portrait de vigneron", plateforme: "Instagram" },
  { jour: 15, titre: "Accord mets & Rosé", plateforme: "Instagram" },
  { jour: 18, titre: "Newsletter mensuelle", plateforme: "Email" },
  { jour: 22, titre: "Réponse avis Marc T.", plateforme: "Avis Google" },
  { jour: 26, titre: "Coulisses du pressurage", plateforme: "Instagram" },
  { jour: 29, titre: "Récap juillet", plateforme: "Email" },
];

export type Visite = {
  id: string;
  client: string;
  clientId?: string;
  date: string;
  heure: string;
  personnes: number;
  langue: string;
  formule: "Découverte" | "Prestige" | "Vendanges" | "Dégustation privée";
  statut: "Confirmée" | "En attente" | "Annulée";
  // Note ou anecdote laissée après une visite terminée — réutilisable par
  // l'IA pour enrichir la charte narrative (piliers d'histoires).
  noteAnecdote?: string;
};

export const visites: Visite[] = [
  // Visites passées (juin), pour démontrer le marquage "Terminée" automatique
  {
    id: "v7",
    client: "Épicerie Fine Bacchus",
    clientId: "c8",
    date: "15 juin 2026",
    heure: "10h00",
    personnes: 3,
    langue: "Français",
    formule: "Découverte",
    statut: "Confirmée",
  },
  {
    id: "v8",
    client: "Château Montfleur — Hôtellerie",
    clientId: "c12",
    date: "17 juin 2026",
    heure: "11h00",
    personnes: 5,
    langue: "Français",
    formule: "Dégustation privée",
    statut: "Confirmée",
  },
  {
    id: "v9",
    client: "Groupe Tokyo Cellars",
    clientId: "c3",
    date: "25 juin 2026",
    heure: "14h00",
    personnes: 6,
    langue: "Anglais",
    formule: "Prestige",
    statut: "Confirmée",
  },
  {
    id: "v1",
    client: "Famille Whitmore",
    clientId: "c2",
    date: "14 juillet 2026",
    heure: "10h30",
    personnes: 4,
    langue: "Anglais",
    formule: "Prestige",
    statut: "Confirmée",
  },
  {
    id: "v2",
    client: "Groupe Tokyo Cellars",
    clientId: "c3",
    date: "16 juillet 2026",
    heure: "14h00",
    personnes: 8,
    langue: "Anglais",
    formule: "Dégustation privée",
    statut: "Confirmée",
  },
  {
    id: "v3",
    client: "Sofia Bergqvist",
    clientId: "c6",
    date: "19 juillet 2026",
    heure: "11h00",
    personnes: 2,
    langue: "Anglais",
    formule: "Découverte",
    statut: "En attente",
  },
  {
    id: "v4",
    client: "Comité d'entreprise Delacroix & Fils",
    clientId: "c4",
    date: "22 juillet 2026",
    heure: "15h30",
    personnes: 15,
    langue: "Français",
    formule: "Découverte",
    statut: "Confirmée",
  },
  {
    id: "v5",
    client: "David Okafor",
    clientId: "c10",
    date: "25 juillet 2026",
    heure: "09h30",
    personnes: 3,
    langue: "Anglais",
    formule: "Vendanges",
    statut: "En attente",
  },
  {
    id: "v6",
    client: "Restaurant Le Clos Doré",
    clientId: "c5",
    date: "27 juillet 2026",
    heure: "16h00",
    personnes: 6,
    langue: "Français",
    formule: "Prestige",
    statut: "Annulée",
  },
];

// Historique du visiteur, pour l'affichage "3e visite, a acheté 18 btl en
// 2025" (5.1). `bouteilles2025` est une donnée historique antérieure au
// registre de la Cave (2026) — les autres volumes d'achat viennent, eux,
// d'un calcul en direct sur `mouvements`.
export const historiqueVisiteurs: Record<
  string,
  { visitesAnterieures: number; bouteilles2025?: number }
> = {
  c2: { visitesAnterieures: 2, bouteilles2025: 18 },
  c10: { visitesAnterieures: 1 },
};

export const visitesStats = {
  totalVisiteurs: 38,
  pourcentageEtrangers: 68,
  tauxAchatPostVisite: 72,
  noteGoogle: 4.8,
  panierMoyen: 340,
};

// --- Shell : profil domaine, notifications ---

export const domaineProfile = {
  nomDomaine: "Champagne des Trois Clos",
  nomVigneron: "Antoine Vasseur",
  initiales: "CT",
  sluggPublic: "champagne-des-trois-clos",
  email: "contact@champagne-des-trois-clos.fr",
  instagramHandle: "champagnedestroisclos",
  facebookHandle: "Champagne des Trois Clos",
};

// Configuration secondaire des visites (5.5) — consultée quelques fois par an.
export const typesVisite = [
  { formule: "Découverte", dureeMinutes: 45, prixParPersonne: 15, jaugeMax: 20 },
  { formule: "Prestige", dureeMinutes: 90, prixParPersonne: 35, jaugeMax: 12 },
  { formule: "Vendanges", dureeMinutes: 120, prixParPersonne: 45, jaugeMax: 10 },
  { formule: "Dégustation privée", dureeMinutes: 60, prixParPersonne: 60, jaugeMax: 8 },
];

export type Notification = {
  id: string;
  type: "reservation" | "avis" | "contenu" | "systeme";
  message: string;
  temps: string;
  lu: boolean;
};

export const notifications: Notification[] = [
  {
    id: "n1",
    type: "reservation",
    message: "Groupe belge (8 pers.) confirmé pour samedi",
    temps: "Il y a 20 min",
    lu: false,
  },
  {
    id: "n2",
    type: "avis",
    message: "Nouvel avis 5 étoiles de Yuki Tanaka",
    temps: "Il y a 1 h",
    lu: false,
  },
  {
    id: "n3",
    type: "contenu",
    message: "Post Instagram sur les vendanges proposé",
    temps: "Il y a 2 h",
    lu: false,
  },
  {
    id: "n4",
    type: "reservation",
    message: "Nouvelle demande de visite de Sofia Bergqvist",
    temps: "Il y a 4 h",
    lu: true,
  },
  {
    id: "n5",
    type: "systeme",
    message: "Commande n°247 marquée préparée",
    temps: "Hier à 17:10",
    lu: true,
  },
];
