import type { CharteNarrative } from "@/lib/mock-data";

// "vin nature" -> "VinNature" — un mot-clé de la charte devient un
// hashtag valide (sans espace, sans accent, sans ponctuation).
export function versHashtag(mot: string): string {
  return mot
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((m) => m.charAt(0).toUpperCase() + m.slice(1))
    .join("")
    .replace(/[^a-zA-Z0-9]/g, "");
}

// 2-3 suggestions tirées du vocabulaire de la charte narrative — jamais
// inventées si la charte n'existe pas encore.
export function suggestionsHashtags(charte: CharteNarrative | null): string[] {
  if (!charte) return [];
  const uniques = Array.from(new Set(charte.vocabulaire.map(versHashtag).filter(Boolean)));
  return uniques.slice(0, 3);
}
