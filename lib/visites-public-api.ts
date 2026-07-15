// Client léger pour /api/public/visites/[slug]/* — jamais de cookie de
// session requis (page accessible sans compte, exigence explicite du
// brief). Même principe que lib/cave-api.ts : pas de contexte global.

export type FormulePublique = {
  id: string;
  nom: string;
  description: string | null;
  duree_minutes: number;
  prix_par_personne: number;
  capacite_max: number;
};

export type CreneauPublic = {
  id: string;
  formule_id: string;
  date: string;
  heure: string;
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

  reserver: (
    slug: string,
    payload: {
      formuleId: string;
      creneauId: string;
      personnes: number;
      visiteurNom: string;
      visiteurEmail?: string;
      visiteurTelephone?: string;
      langue?: string;
    }
  ) =>
    appelJson<{ reservation: { id: string; date: string; heure: string } }>(`/api/public/visites/${slug}/reserver`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),
};
