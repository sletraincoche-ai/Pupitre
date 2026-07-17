// Client léger pour /api/public/visites/[slug]/* — jamais de cookie de
// session requis (page accessible sans compte, exigence explicite du
// brief). Même principe que lib/cave-api.ts : pas de contexte global.

export type FormulePublique = {
  id: string;
  nom: string;
  description: string | null;
  duree_minutes: number;
  mode_tarification: "gratuit" | "total" | "par_personne";
  prix_par_personne: number;
  prix_total: number | null;
  capacite_max: number;
};

export type CreneauPublic = {
  id: string;
  formule_id: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  capaciteMax: number;
  restante: number;
};

async function appelJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Erreur inconnue.");
  return data as T;
}

export const visitesPublicApi = {
  listerFormules: (slug: string) => appelJson<{ formules: FormulePublique[]; nomDomaine: string | null }>(`/api/public/visites/${slug}/formules`),

  listerCreneaux: (slug: string, formuleId: string) =>
    appelJson<{ creneaux: CreneauPublic[] }>(`/api/public/visites/${slug}/creneaux?formuleId=${formuleId}`),

  // "en_attente" à la création (V3) — jamais confirmée directement, le
  // domaine valide ou refuse depuis "Demandes en ligne". formuleId +
  // date + heureDebut (jamais un creneauId brut) : la disponibilité
  // choisie peut être une occurrence virtuelle d'une règle récurrente,
  // résolue/matérialisée côté serveur au moment de la réservation.
  reserver: (
    slug: string,
    payload: {
      formuleId: string;
      date: string;
      heureDebut: string;
      personnes: number;
      visiteurNom: string;
      visiteurEmail?: string;
      visiteurTelephone?: string;
      langue?: string;
    }
  ) =>
    appelJson<{ reservation: { id: string; date: string; heure_debut: string; heure_fin: string } }>(`/api/public/visites/${slug}/reserver`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),
};
