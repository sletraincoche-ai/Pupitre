// Parsing de dates calendaires ("AAAA-MM-JJ") sans jamais passer par
// `new Date(chaîne)` ou `toISOString()` — les deux interprètent une date
// sans heure comme minuit UTC, ce qui l'affiche décalée d'un jour dans
// tout fuseau en avance sur UTC (le bug "Aujourd'hui/Demain inversés"
// du brief Visites V3). Toujours utiliser ces helpers pour toute date
// calendaire venant de l'API (created_at avec heure exclu).

export function parseDateLocale(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function versDateISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function formatDateLongue(dateStr: string, options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }): string {
  return parseDateLocale(dateStr).toLocaleDateString("fr-FR", options);
}

export function formatDateCourte(dateStr: string): string {
  return parseDateLocale(dateStr).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit" });
}

// "10:00" + 45 -> "10:45" — sert à auto-remplir l'heure de fin dès
// qu'une formule est choisie (durée pré-configurée), côté client.
export function ajouterMinutes(heure: string, minutes: number): string {
  const [h, m] = heure.split(":").map(Number);
  const total = (((h * 60 + m + minutes) % (24 * 60)) + 24 * 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export const JOURS_SEMAINE_ISO: { valeur: number; label: string; abrege: string }[] = [
  { valeur: 1, label: "Lundi", abrege: "Lun" },
  { valeur: 2, label: "Mardi", abrege: "Mar" },
  { valeur: 3, label: "Mercredi", abrege: "Mer" },
  { valeur: 4, label: "Jeudi", abrege: "Jeu" },
  { valeur: 5, label: "Vendredi", abrege: "Ven" },
  { valeur: 6, label: "Samedi", abrege: "Sam" },
  { valeur: 7, label: "Dimanche", abrege: "Dim" },
];
