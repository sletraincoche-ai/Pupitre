// Parsing CSV générique et réel (remplace l'ancien lib/import-clients.ts,
// qui produisait des Client[] au format mock — ce fichier ne connaît
// aucun type client, juste des lignes de texte, réutilisable ailleurs).
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

export function deviner(entetes: string[], motsCles: string[]): number | null {
  const index = entetes.findIndex((entete) => motsCles.some((mot) => entete.toLowerCase().includes(mot)));
  return index >= 0 ? index : null;
}
