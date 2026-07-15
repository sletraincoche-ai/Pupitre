// Client léger pour /api/clients — même principe que lib/cave-api.ts et
// lib/facturation-api.ts (pas de contexte global, chaque écran
// récupère/mute ses propres données).

export type ProfilClient = "particulier" | "professionnel" | "chr";

export type StatsClient = {
  dernierAchat: string | null;
  montantTotal: number;
  nombreAchats: number;
  bouteillesAchetees: number;
};

export type Client = {
  id: string;
  nom: string;
  profil: ProfilClient;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  pays: string;
  siret: string | null;
  tva_intracommunautaire: string | null;
  origine: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
};

export type ClientAvecStats = Client & { stats: StatsClient; segments: string[] };

export type AchatClient = {
  id: string;
  type: "vente_client" | "export";
  quantite_bouteilles: number;
  montant: number | null;
  horodatage: string;
  annule: boolean;
  cave_produits?: { nom: string; millesime: string | null };
};

export type DocumentClient = {
  id: string;
  type: "facture" | "avoir" | "devis" | "bon_livraison";
  numero: string | null;
  statut: "brouillon" | "emis" | "annule";
  date_emission: string | null;
  total_ttc: number;
  created_at: string;
};

async function appelJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Erreur inconnue.");
  return data as T;
}

export type PayloadClient = {
  nom: string;
  profil?: ProfilClient;
  email?: string;
  telephone?: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  pays?: string;
  siret?: string;
  tvaIntracommunautaire?: string;
  origine?: string;
  notes?: string;
  tags?: string[];
};

export const clientsApi = {
  lister: () => appelJson<{ clients: ClientAvecStats[] }>("/api/clients"),

  creer: (payload: PayloadClient) =>
    appelJson<{ client: Client }>("/api/clients", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),

  obtenir: (id: string) =>
    appelJson<{ client: Client; achats: AchatClient[]; documents: DocumentClient[]; stats: StatsClient; segments: string[] }>(`/api/clients/${id}`),

  modifier: (id: string, payload: Partial<PayloadClient>) =>
    appelJson<{ client: Client }>(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),

  importer: (lignes: { nom: string; email?: string; telephone?: string; pays?: string }[]) =>
    appelJson<{ importes: number; doublons: number; incomplets: number }>("/api/clients/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lignes }),
    }),
};
