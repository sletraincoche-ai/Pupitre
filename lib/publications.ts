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
};

export function formatDateFr(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}
