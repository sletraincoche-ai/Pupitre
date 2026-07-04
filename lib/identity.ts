import type { CharteNarrative } from "@/lib/mock-data";

export type TypeQuestionIdentite = "texte" | "choix" | "photos";

export type QuestionIdentite = {
  id: string;
  groupe: string;
  texte: string;
  type: TypeQuestionIdentite;
  placeholder?: string;
  options?: string[];
};

export const questionsIdentite: QuestionIdentite[] = [
  {
    id: "annee_debut",
    groupe: "Histoire",
    texte: "En quelle année votre famille a-t-elle commencé à produire du champagne ?",
    type: "texte",
    placeholder: "ex. 1952",
  },
  {
    id: "generations",
    groupe: "Histoire",
    texte: "Combien de générations se sont succédé sur le domaine ?",
    type: "texte",
    placeholder: "ex. 4",
  },
  {
    id: "anecdote",
    groupe: "Histoire",
    texte: "Y a-t-il une anecdote ou un souvenir précis que vous aimez raconter aux visiteurs ?",
    type: "texte",
    placeholder: "Racontez en une phrase",
  },
  {
    id: "superficie",
    groupe: "Terroir et parcelles",
    texte: "Combien d'hectares cultivez-vous, et sur quelle(s) commune(s) ?",
    type: "texte",
    placeholder: "ex. 8 hectares à Verzenay",
  },
  {
    id: "parcelle",
    groupe: "Terroir et parcelles",
    texte: "Y a-t-il une parcelle qui a une histoire ou un nom particulier ?",
    type: "texte",
    placeholder: "ex. La Croix Rouge",
  },
  {
    id: "distinction",
    groupe: "Terroir et parcelles",
    texte:
      "Quel cépage ou quelle méthode vous distingue le plus (bio, biodynamie, vieilles vignes, vinification particulière...) ?",
    type: "texte",
    placeholder: "ex. Vieilles vignes en biodynamie",
  },
  {
    id: "cuvee_fierte",
    groupe: "Cuvées",
    texte: "Quelle est la cuvée dont vous êtes le plus fier, et pourquoi ?",
    type: "texte",
    placeholder: "ex. Le Brut Réserve, pour son équilibre",
  },
  {
    id: "style",
    groupe: "Cuvées",
    texte: "Comment décririez-vous votre style en une phrase (ex : vif et minéral / rond et généreux) ?",
    type: "texte",
    placeholder: "ex. Vif et minéral",
  },
  {
    id: "accueil_mots",
    groupe: "Ton et voix",
    texte: "Si un client devait décrire votre accueil en trois mots, quels seraient-ils ?",
    type: "texte",
    placeholder: "ex. Chaleureux, sincère, généreux",
  },
  {
    id: "ton",
    groupe: "Ton et voix",
    texte: "Préférez-vous un ton plutôt sobre et classique, ou chaleureux et proche du client ?",
    type: "choix",
    options: ["Sobre et classique", "Équilibré", "Chaleureux et proche du client"],
  },
  {
    id: "interdits",
    groupe: "Ton et voix",
    texte: "Y a-t-il des mots ou expressions que vous n'utiliseriez jamais pour parler de votre champagne ?",
    type: "texte",
    placeholder: "ex. \"petit prix\", \"bulles\"",
  },
  {
    id: "photos",
    groupe: "Photos",
    texte: "Une photo du domaine, de la cave ou des vignes ?",
    type: "photos",
  },
];

export type ReponsesIdentite = Record<string, string>;

export function construireCharte(reponses: ReponsesIdentite): CharteNarrative {
  const ton = reponses.ton || "Équilibré";
  const style = reponses.style?.trim();

  const piliers = [
    reponses.annee_debut &&
      `Domaine fondé en ${reponses.annee_debut}${reponses.generations ? ` — ${reponses.generations} générations` : ""}`,
    reponses.anecdote,
    reponses.parcelle,
    reponses.cuvee_fierte,
  ].filter((p): p is string => !!p && p.trim().length > 0);

  const vocabulaire = (reponses.accueil_mots ?? "")
    .split(/[,;]/)
    .map((m) => m.trim())
    .filter(Boolean);

  const interdits = (reponses.interdits ?? "")
    .split(/[,;]/)
    .map((m) => m.trim())
    .filter(Boolean);

  return {
    ton: style ? `${ton} — ${style}` : ton,
    piliers: piliers.slice(0, 4),
    vocabulaire,
    interdits,
  };
}
