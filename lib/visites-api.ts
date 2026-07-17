// Client léger pour /api/visites/* — pas de contexte global, même
// principe que lib/cave-api.ts / lib/clients-api.ts.

export type ModeTarification = "gratuit" | "total" | "par_personne";

export type Formule = {
  id: string;
  nom: string;
  description: string | null;
  duree_minutes: number;
  mode_tarification: ModeTarification;
  prix_par_personne: number;
  prix_total: number | null;
  capacite_max: number;
  archive: boolean;
};

export type Creneau = {
  id: string;
  formule_id: string;
  disponibilite_id: string | null;
  date: string;
  heure_debut: string;
  heure_fin: string;
  capacite_max: number;
  reservees: number;
  restante: number;
  visites_formules?: { nom: string };
};

export type DisponibiliteRecurrente = {
  id: string;
  formule_id: string;
  jour_semaine: number;
  heure_debut: string;
  heure_fin: string;
  capacite_max: number;
  actif: boolean;
  visites_formules?: { nom: string };
};

export type ExceptionDisponibilite = {
  id: string;
  disponibilite_id: string;
  date: string;
  motif: string | null;
};

export type StatutReservation = "confirmee" | "arrivee" | "terminee" | "annulee" | "en_attente" | "refusee";
export type OrigineReservation = "en_ligne" | "walk_in" | "manuel";
export type StatutPaiement = "a_configurer" | "paye_sur_place" | "paye_ligne" | "rembourse";

export type Reservation = {
  id: string;
  formule_id: string;
  creneau_id: string | null;
  date: string;
  heure_debut: string;
  heure_fin: string;
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
  relance_envoyee_le: string | null;
  created_at: string;
  visites_formules?: { nom: string; duree_minutes: number };
  cave_mouvements?: { id: string; montant: number | null; quantite_bouteilles: number }[];
};

async function appelJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Erreur inconnue.");
  return data as T;
}

export type PayloadFormule = {
  nom: string;
  description?: string;
  dureeMinutes: number;
  modeTarification: ModeTarification;
  prixParPersonne?: number;
  prixTotal?: number;
  capaciteMax: number;
};

export type PayloadCreneauPonctuel = {
  formuleId: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  capaciteMax: number;
};

export type PayloadDisponibiliteRecurrente = {
  formuleId: string;
  jourSemaine: number;
  heureDebut: string;
  heureFin: string;
  capaciteMax: number;
};

export type PayloadNouvelleVisite = {
  formuleId: string;
  date: string;
  heureDebut: string;
  heureFin?: string;
  personnes: number;
  visiteurNom?: string;
  visiteurEmail?: string;
  visiteurTelephone?: string;
  clientId?: string;
};

export const visitesApi = {
  listerFormules: () => appelJson<{ formules: Formule[] }>("/api/visites/formules"),

  creerFormule: (payload: PayloadFormule) =>
    appelJson<{ formule: Formule }>("/api/visites/formules", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),

  modifierFormule: (id: string, payload: Partial<PayloadFormule> & { archive?: boolean }) =>
    appelJson<{ formule: Formule }>(`/api/visites/formules/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),

  listerCreneaux: (depuis?: string) => appelJson<{ creneaux: Creneau[] }>(`/api/visites/creneaux${depuis ? `?depuis=${depuis}` : ""}`),

  // "Mes disponibilités" — créneau ponctuel, jamais de nom rattaché
  // (action strictement séparée de "Nouvelle visite").
  creerCreneauPonctuel: (payload: PayloadCreneauPonctuel) =>
    appelJson<{ creneau: Creneau }>("/api/visites/creneaux", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),

  supprimerCreneau: (id: string) => appelJson<{ ok: true }>(`/api/visites/creneaux/${id}`, { method: "DELETE" }),

  listerDisponibilitesRecurrentes: () => appelJson<{ disponibilites: DisponibiliteRecurrente[] }>("/api/visites/disponibilites/recurrentes"),

  creerDisponibiliteRecurrente: (payload: PayloadDisponibiliteRecurrente) =>
    appelJson<{ disponibilite: DisponibiliteRecurrente }>("/api/visites/disponibilites/recurrentes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),

  modifierDisponibiliteRecurrente: (id: string, actif: boolean) =>
    appelJson<{ disponibilite: DisponibiliteRecurrente }>(`/api/visites/disponibilites/recurrentes/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ actif }),
    }),

  listerExceptions: (disponibiliteId: string) =>
    appelJson<{ exceptions: ExceptionDisponibilite[] }>(`/api/visites/disponibilites/recurrentes/${disponibiliteId}/exceptions`),

  ajouterException: (disponibiliteId: string, date: string, motif?: string) =>
    appelJson<{ exception: ExceptionDisponibilite }>(`/api/visites/disponibilites/recurrentes/${disponibiliteId}/exceptions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ date, motif }),
    }),

  supprimerException: (id: string) => appelJson<{ ok: true }>(`/api/visites/disponibilites/exceptions/${id}`, { method: "DELETE" }),

  listerReservations: (date: string) => appelJson<{ reservations: Reservation[] }>(`/api/visites/reservations?date=${date}`),

  // "Nouvelle visite" — le viticulteur programme lui-même une visite,
  // confirmée immédiatement (remplace l'ancien "Nouveau visiteur").
  creerNouvelleVisite: (payload: PayloadNouvelleVisite) =>
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

  // "Demandes en ligne" — réservations publiques en attente de validation.
  listerDemandes: () => appelJson<{ demandes: Reservation[] }>("/api/visites/demandes"),

  validerDemande: (id: string) => appelJson<{ reservation: Reservation }>(`/api/visites/demandes/${id}/valider`, { method: "POST" }),

  refuserDemande: (id: string, motif: string) =>
    appelJson<{ reservation: Reservation }>(`/api/visites/demandes/${id}/refuser`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ motif }),
    }),

  parametres: () => appelJson<{ slugPublic: string | null }>("/api/visites/parametres"),

  enregistrerSlug: (slugPublic: string) =>
    appelJson<{ ok: true; slugPublic: string }>("/api/visites/parametres", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slugPublic }),
    }),
};
