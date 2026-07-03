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
  {
    id: "visites",
    label: "Visites œnotourisme",
    value: "142",
    delta: "-4,2%",
    trend: "down" as const,
    good: false,
  },
  {
    id: "dormants",
    label: "Clients dormants",
    value: "37",
    delta: "-9",
    trend: "down" as const,
    good: true,
  },
];

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

export const activites = [
  {
    id: "a1",
    type: "commande",
    texte: "Nouvelle commande de Château Montfleur — Hôtellerie (48 bouteilles)",
    temps: "Il y a 12 min",
  },
  {
    id: "a2",
    type: "visite",
    texte: "Réservation visite Prestige confirmée pour le 14 juillet",
    temps: "Il y a 47 min",
  },
  {
    id: "a3",
    type: "studio",
    texte: "3 publications générées par l'IA en attente de validation",
    temps: "Il y a 1 h",
  },
  {
    id: "a4",
    type: "client",
    texte: "James Whitmore a été déplacé vers le segment VIP",
    temps: "Il y a 3 h",
  },
  {
    id: "a5",
    type: "stock",
    texte: "Stock du Blanc de Blancs sous le seuil des 20%",
    temps: "Il y a 5 h",
  },
  {
    id: "a6",
    type: "commande",
    texte: "Commande export expédiée vers Sofia Bergqvist (Suède)",
    temps: "Hier à 18:22",
  },
];

export const stockCuvees = [
  { id: "s1", nom: "Brut Réserve", pourcentage: 72, bouteilles: 4320 },
  { id: "s2", nom: "Blanc de Blancs", pourcentage: 18, bouteilles: 540 },
  { id: "s3", nom: "Rosé de Saignée", pourcentage: 45, bouteilles: 1290 },
  { id: "s4", nom: "Millésime 2016", pourcentage: 61, bouteilles: 980 },
  { id: "s5", nom: "Extra-Brut Vigneron", pourcentage: 33, bouteilles: 760 },
];

export const briefHebdomadaire = [
  {
    id: "b1",
    titre: "Relancer 7 clients dormants",
    description:
      "Segment identifié avec un dernier achat de plus de 6 mois. Une campagne e-mail ciblée est prête dans Studio.",
    priorite: "Haute",
    action: "Relancer",
  },
  {
    id: "b2",
    titre: "Réapprovisionner le Blanc de Blancs",
    description:
      "Stock sous 20%. Au rythme actuel des ventes, rupture estimée sous 3 semaines.",
    priorite: "Haute",
    action: "Commander",
  },
  {
    id: "b3",
    titre: "Valider le calendrier éditorial de juillet",
    description:
      "3 publications IA en attente pour Instagram, l'e-mail et les avis Google.",
    priorite: "Moyenne",
    action: "Ouvrir Studio",
  },
];

export type ContenuStudio = {
  id: string;
  plateforme: "Instagram" | "Email" | "Avis Google";
  texte: string;
  contexte?: string;
  date: string;
  statut: "En attente";
};

export const contenusStudio: ContenuStudio[] = [
  {
    id: "st1",
    plateforme: "Instagram",
    texte:
      "☀️ Les premières grappes rosissent sous le soleil de juillet. Encore quelques semaines avant les vendanges 2026... #ChampagnePupitre #Vignoble",
    date: "5 juillet",
    statut: "En attente",
  },
  {
    id: "st2",
    plateforme: "Email",
    texte:
      "Chers amateurs, découvrez notre Millésime 2016 en édition limitée — 980 bouteilles seulement, disponibles dès cette semaine sur réservation.",
    date: "7 juillet",
    statut: "En attente",
  },
  {
    id: "st3",
    plateforme: "Avis Google",
    texte:
      "Merci infiniment pour ce message, Élodie ! C'est un plaisir de vous avoir reçue au domaine. Nous avons hâte de vous faire découvrir notre prochaine cuvée. À très bientôt !",
    contexte:
      "★★★★★ Élodie R. — \"Accueil chaleureux, dégustation exceptionnelle et un rosé de saignée à tomber. On reviendra avec des amis !\"",
    date: "9 juillet",
    statut: "En attente",
  },
];

export type EvenementCalendrier = {
  jour: number;
  titre: string;
  plateforme: ContenuStudio["plateforme"];
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
  date: string;
  heure: string;
  personnes: number;
  langue: string;
  formule: "Découverte" | "Prestige" | "Vendanges" | "Dégustation privée";
  statut: "Confirmée" | "En attente" | "Annulée";
};

export const visites: Visite[] = [
  {
    id: "v1",
    client: "Famille Whitmore",
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
    date: "27 juillet 2026",
    heure: "16h00",
    personnes: 6,
    langue: "Français",
    formule: "Prestige",
    statut: "Annulée",
  },
];

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
};

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
