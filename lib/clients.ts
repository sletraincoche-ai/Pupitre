import type { Mouvement, Visite } from "@/lib/mock-data";
import { getBouteillesAchetees } from "@/lib/visites";

export function getMouvementsClient(clientId: string, mouvements: Mouvement[]): Mouvement[] {
  return [...mouvements]
    .filter((m) => m.clientId === clientId)
    .sort((a, b) => `${b.date}T${b.heure}`.localeCompare(`${a.date}T${a.heure}`));
}

export function getTotalDepense(clientId: string, mouvements: Mouvement[]): number {
  return mouvements
    .filter((m) => m.clientId === clientId && m.type === "sortie" && m.prixUnitaire)
    .reduce((total, m) => total + m.quantite * (m.prixUnitaire ?? 0), 0);
}

export function getStatsClient(clientId: string, mouvements: Mouvement[], visites: Visite[]) {
  return {
    totalDepense: getTotalDepense(clientId, mouvements),
    nombreVisites: visites.filter((v) => v.clientId === clientId).length,
    bouteillesAchetees: getBouteillesAchetees(clientId, mouvements),
  };
}
