import type { ReseauPlateforme, FormatContenu } from "@/lib/mock-data";

export type StatutPublication = "brouillon" | "programmee" | "publiee";

export type PublicationReelle = {
  id: string;
  plateforme: ReseauPlateforme;
  format: FormatContenu;
  statut: StatutPublication;
  photos: string[];
  legende: string;
  hashtags: string[];
  musique?: string;
  date: string;
  // Date + heure choisies dans le calendrier de programmation — présent
  // uniquement pour les publications au statut "programmee".
  scheduledFor?: string;
};

export function formatDateFr(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

export function formatDateHeureFr(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}
