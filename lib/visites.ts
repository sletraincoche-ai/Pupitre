import {
  AUJOURDHUI,
  historiqueVisiteurs,
  type Mouvement,
  type Visite,
} from "@/lib/mock-data";
import { parseDateFr } from "@/lib/agenda";
import { toDateKey } from "@/lib/cave";

export function getBouteillesAchetees(clientId: string, mouvements: Mouvement[]): number {
  return mouvements
    .filter((m) => m.clientId === clientId && m.type === "sortie")
    .reduce((total, m) => total + m.quantite, 0);
}

export function formatHistorique(
  visite: Visite,
  mouvements: Mouvement[],
  toutesLesVisites: Visite[]
): string {
  const clientId = visite.clientId;
  if (!clientId) return "Visiteur non rattaché à une fiche client";

  // Compte les visites du même client antérieures à celle-ci dans nos
  // données, en plus d'un éventuel historique antérieur au jeu de données
  // (`visitesAnterieures`, pour un client qui n'a qu'une seule visite
  // visible ici mais en a fait d'autres avant).
  const dateVisite = parseDateFr(visite.date);
  const soeursAvant = toutesLesVisites.filter(
    (v) => v.clientId === clientId && v.id !== visite.id && parseDateFr(v.date) < dateVisite
  ).length;

  const hist = historiqueVisiteurs[clientId];
  const ordinal = (hist?.visitesAnterieures ?? 0) + soeursAvant + 1;
  const bouteillesVecues = hist?.bouteilles2025;
  const bouteillesEnCours = getBouteillesAchetees(clientId, mouvements);

  if (ordinal === 1 && !bouteillesVecues && bouteillesEnCours === 0) {
    return "Nouveau visiteur";
  }

  const ordinalLabel = ordinal === 1 ? "1ère visite" : `${ordinal}e visite`;
  const achatsLabel = bouteillesVecues
    ? `${bouteillesVecues} bouteilles achetées en 2025`
    : bouteillesEnCours > 0
      ? `${bouteillesEnCours} bouteilles achetées`
      : null;

  return achatsLabel ? `${ordinalLabel} · ${achatsLabel}` : ordinalLabel;
}

// Une visite passée se marque "Terminée" si une vente a été enregistrée
// pour ce client à sa date ou après — sans action manuelle (5.3).
export function estTerminee(visite: Visite, mouvements: Mouvement[]): boolean {
  if (!visite.clientId) return false;
  const dateVisite = parseDateFr(visite.date);
  return mouvements.some(
    (m) => m.clientId === visite.clientId && m.type === "sortie" && m.date >= dateVisite
  );
}

export function estPassee(visite: Visite): boolean {
  return parseDateFr(visite.date) < toDateKey(AUJOURDHUI);
}

// La prochaine visite à venir (aujourd'hui inclus), en excluant les annulées.
export function getProchaineVisite(visites: Visite[]): Visite | null {
  const aujourdhuiKey = toDateKey(AUJOURDHUI);
  const aVenir = visites
    .filter((v) => v.statut !== "Annulée" && parseDateFr(v.date) >= aujourdhuiKey)
    .sort((a, b) => parseDateFr(a.date).localeCompare(parseDateFr(b.date)));
  return aVenir[0] ?? null;
}

const messages: Record<string, (visite: Visite, nomDomaine: string) => { canal: "sms" | "email"; texte: string }> = {
  Anglais: (v, nom) => ({
    canal: v.personnes <= 4 ? "sms" : "email",
    texte: `Hello! Your visit at ${nom} is confirmed for ${v.date} at ${v.heure} (${v.formule}, ${v.personnes} guest${v.personnes > 1 ? "s" : ""}). We look forward to welcoming you!`,
  }),
  Français: (v, nom) => ({
    canal: v.personnes <= 4 ? "sms" : "email",
    texte: `Bonjour, nous vous confirmons votre visite au ${nom} le ${v.date} à ${v.heure} (formule ${v.formule}, ${v.personnes} pers.). À très bientôt !`,
  }),
};

export function genererMessageConfirmation(visite: Visite, nomDomaine: string) {
  const generateur = messages[visite.langue] ?? messages.Français;
  return generateur(visite, nomDomaine);
}
