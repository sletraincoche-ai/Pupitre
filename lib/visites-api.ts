// Client léger pour /api/visites/* — pas de contexte global, même
// principe que lib/cave-api.ts / lib/clients-api.ts.

export type Formule = {
  id: string;
  nom: string;
  description: string | null;
  duree_minutes: number;
  prix_par_personne: number;
  capacite_max: number;
  archive: boolean;
};

export type Creneau = {
  id: string;
  formule_id: string;
  date: string;
  heure: string;
  capacite_max: number;
  reservees: number;
  restante: number;
  visites_formules?: { nom: string };
};

export type StatutReservation = "confirmee" | "arrivee" | "terminee" | "annulee";
export type OrigineReservation = "en_ligne" | "walk_in" | "manuel";
export type StatutPaiement = "a_configurer" | "paye_sur_place" | "paye_ligne" | "rembourse";

export type Reservation = {
  id: string;
  formule_id: string;
  creneau_id: string | null;
  date: string;
  heure: string;
  personnes: number;
  visiteur_nom: string;
  visiteur_email: string | null;
  visiteur_telephone: string | null;
  langue: string;
  client_id: string | null;
  statut: StatutReservation;
  origine: OrigineReservation;
  statut_paiement: StatutPaiement;
  moyen_paiement: string | null;
  montant_du: number | null;
  note_anecdote: string | null;
  checkin_le: string | null;
  annule: boolean;
  annule_le: string | null;
  motif_annulation: string | null;
  visites_formules?: { nom: string; duree_minutes: number };
  cave_mouvements?: { id: string; montant: number | null; quantite_bouteilles: number }[];
};

async function appelJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Erreur inconnue.");
  return data as T;
}

export const visitesApi = {
  listerFormules: () => appelJson<{ formules: Formule[] }>("/api/visites/formules"),

  creerFormule: (payload: { nom: string; description?: string; dureeMinutes: number; prixParPersonne: number; capaciteMax: number }) =>
    appelJson<{ formule: Formule }>("/api/visites/formules", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),

  modifierFormule: (id: string, payload: Partial<{ nom: string; description: string; dureeMinutes: number; prixParPersonne: number; capaciteMax: number; archive: boolean }>) =>
    appelJson<{ formule: Formule }>(`/api/visites/formules/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),

  listerCreneaux: (depuis?: string) => appelJson<{ creneaux: Creneau[] }>(`/api/visites/creneaux${depuis ? `?depuis=${depuis}` : ""}`),

  creerCreneau: (payload: { formuleId: string; date: string; heure: string; capaciteMax?: number }) =>
    appelJson<{ creneau: Creneau }>("/api/visites/creneaux", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),

  supprimerCreneau: (id: string) => appelJson<{ ok: true }>(`/api/visites/creneaux/${id}`, { method: "DELETE" }),

  listerReservations: (date: string) => appelJson<{ reservations: Reservation[] }>(`/api/visites/reservations?date=${date}`),

  creerReservation: (payload: {
    formuleId: string;
    creneauId?: string;
    date?: string;
    heure?: string;
    personnes: number;
    visiteurNom: string;
    visiteurEmail?: string;
    visiteurTelephone?: string;
    langue?: string;
    origine: "walk_in" | "manuel";
  }) =>
    appelJson<{ reservation: Reservation }>("/api/visites/reservations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),

  checkin: (id: string) => appelJson<{ reservation: Reservation }>(`/api/visites/reservations/${id}/checkin`, { method: "POST" }),

  terminer: (id: string, noteAnecdote?: string) =>
    appelJson<{ reservation: Reservation }>(`/api/visites/reservations/${id}/terminer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ noteAnecdote }),
    }),

  annuler: (id: string, motif: string) =>
    appelJson<{ reservation: Reservation }>(`/api/visites/reservations/${id}/annuler`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ motif }),
    }),

  marquerPaye: (id: string, moyenPaiement: string) =>
    appelJson<{ reservation: Reservation }>(`/api/visites/reservations/${id}/paiement`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ moyenPaiement }),
    }),

  parametres: () => appelJson<{ slugPublic: string | null }>("/api/visites/parametres"),

  enregistrerSlug: (slugPublic: string) =>
    appelJson<{ ok: true; slugPublic: string }>("/api/visites/parametres", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slugPublic }),
    }),
};
