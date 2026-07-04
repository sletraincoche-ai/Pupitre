import type { Client } from "@/lib/mock-data";

export function parseCsv(texte: string): { entetes: string[]; lignes: string[][] } {
  const lignesBrutes = texte
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lignesBrutes.length === 0) return { entetes: [], lignes: [] };

  const separer = (ligne: string) => ligne.split(",").map((cellule) => cellule.trim().replace(/^"|"$/g, ""));

  const [entete, ...reste] = lignesBrutes;
  return { entetes: separer(entete), lignes: reste.map(separer) };
}

export type Mapping = { nom: number | null; email: number | null; pays: number | null };

export type LigneImport = {
  nom: string;
  email: string;
  pays: string;
  doublon: boolean;
  incomplete: boolean;
};

export function analyserLignes(
  lignes: string[][],
  mapping: Mapping,
  clientsExistants: Client[]
): LigneImport[] {
  const emailsExistants = new Set(clientsExistants.map((c) => c.email.toLowerCase()));

  return lignes.map((ligne) => {
    const nom = mapping.nom !== null ? (ligne[mapping.nom] ?? "") : "";
    const email = mapping.email !== null ? (ligne[mapping.email] ?? "") : "";
    const pays = mapping.pays !== null ? (ligne[mapping.pays] ?? "") : "";
    return {
      nom,
      email,
      pays,
      incomplete: !nom || !email,
      doublon: !!email && emailsExistants.has(email.toLowerCase()),
    };
  });
}

function initiales(nom: string): string {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot[0]?.toUpperCase() ?? "")
    .join("");
}

export function construireClients(lignes: LigneImport[]): Client[] {
  return lignes
    .filter((l) => !l.incomplete && !l.doublon)
    .map((l, index) => ({
      id: `import-${Date.now()}-${index}`,
      nom: l.nom,
      initiales: initiales(l.nom) || "?",
      pays: l.pays || "Inconnu",
      drapeau: "🌍",
      email: l.email,
      origine: "Site web" as const,
      segment: "Nouveau" as const,
      tags: [],
      totalAchats: 0,
      derniereCommande: "—",
      statut: "Actif" as const,
    }));
}
