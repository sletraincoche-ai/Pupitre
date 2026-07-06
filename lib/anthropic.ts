// Intégration Claude Sonnet (API Anthropic) — utilisé uniquement côté
// serveur (routes API). Ne jamais importer ce fichier depuis un composant
// client : ANTHROPIC_API_KEY ne doit jamais atteindre le bundle navigateur.

import { questionsIdentite, type ReponsesIdentite, type CharteBrute } from "@/lib/identity";

export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";

export function isAnthropicConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

const SYSTEM_PROMPT = `Tu es un copilote éditorial pour un vigneron indépendant en Champagne, sur l'application PUPITRE.

On te donne les réponses d'un vigneron à un test d'identité en 12 questions sur son histoire, son terroir et sa voix.
Ta tâche : produire une charte narrative qui capture ce qui rend CE domaine différent de tous les autres — jamais de
formulation générique interchangeable d'un vigneron à l'autre.

Réponds UNIQUEMENT avec un objet JSON strict, sans préambule, sans markdown, exactement sous cette forme :
{
  "ton": "une description du ton en quelques mots, dérivée de ses réponses",
  "piliers": ["3 à 4 phrases courtes, chacune un fait ou une anecdote réutilisable dans un post ou un email"],
  "vocabulaire": ["3 à 6 mots ou expressions qui reviennent dans sa façon de parler de son domaine"],
  "interdits": ["mots ou expressions qu'il ne faut jamais utiliser, repris tels quels s'il en a donné"]
}

Si une réponse est absente (question passée), ignore-la simplement — ne l'invente jamais.`;

function construireUserPrompt(reponses: ReponsesIdentite): string {
  const lignes = questionsIdentite
    .filter((q) => q.type !== "photos")
    .map((q) => {
      const reponse = reponses[q.id]?.trim();
      return reponse ? `${q.texte}\n→ ${reponse}` : null;
    })
    .filter((l): l is string => !!l);

  return lignes.join("\n\n");
}

export async function genererCharteViaAnthropic(reponses: ReponsesIdentite): Promise<CharteBrute> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: construireUserPrompt(reponses) }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Appel Anthropic échoué (${res.status})`);
  }

  const data = await res.json();
  const texte: string = data.content?.[0]?.text ?? "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(texte);
  } catch {
    throw new Error("Réponse de l'IA non conforme au format JSON attendu");
  }

  const charte = parsed as Partial<CharteBrute>;
  if (!charte.ton || !Array.isArray(charte.piliers)) {
    throw new Error("Réponse de l'IA incomplète");
  }

  return {
    ton: charte.ton,
    piliers: charte.piliers,
    vocabulaire: Array.isArray(charte.vocabulaire) ? charte.vocabulaire : [],
    interdits: Array.isArray(charte.interdits) ? charte.interdits : [],
  };
}
