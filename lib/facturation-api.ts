// Client léger pour les routes /api/facturation/* et /api/caisse/* —
// même principe que lib/cave-api.ts (pas de contexte global, chaque
// écran récupère/mute ses propres données).

export type ProfilClient = "particulier" | "professionnel" | "chr";

export type Client = {
  id: string;
  nom: string;
  profil: ProfilClient;
  email: string | null;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  pays: string;
  siret: string | null;
  tva_intracommunautaire: string | null;
};

export type TypeDocumentFacturation = "facture" | "avoir" | "devis" | "bon_livraison";
export type StatutDocument = "brouillon" | "emis" | "annule";

export type DocumentFacturation = {
  id: string;
  type: TypeDocumentFacturation;
  numero: string | null;
  statut: StatutDocument;
  statut_paiement: "non_payee" | "partiellement_payee" | "payee" | null;
  client_id: string | null;
  client_nom_snapshot: string | null;
  client_adresse_snapshot: string | null;
  client_siret_snapshot: string | null;
  client_tva_snapshot: string | null;
  document_source_id: string | null;
  date_emission: string | null;
  date_echeance: string | null;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  observations: string | null;
  created_at: string;
  clients?: { nom: string; profil: ProfilClient };
};

export type LigneFacturation = {
  id: string;
  document_id: string;
  designation: string;
  quantite: number;
  unite: string;
  prix_unitaire_ht: number;
  taux_tva: number;
  montant_ht: number;
  cave_produit_id: string | null;
  cave_mouvement_id: string | null;
  ordre: number;
};

export type ParametresLegaux = {
  raison_sociale: string | null;
  forme_juridique: string | null;
  capital_social: number | null;
  siret: string | null;
  tva_intracommunautaire: string | null;
  rcs_ville: string | null;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  pays: string;
  iban: string | null;
  bic: string | null;
  mention_penalites_retard: string | null;
};

export type VenteComptoirDisponible = {
  id: string;
  produit_id: string;
  quantite_bouteilles: number;
  prix_unitaire: number | null;
  montant: number | null;
  horodatage: string;
  cave_produits?: { nom: string; millesime: string | null };
};

async function appelJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Erreur inconnue.");
  return data as T;
}

export type LignePayload = {
  designation: string;
  quantite: number;
  prixUnitaireHt: number;
  tauxTva?: number;
  unite?: string;
  caveProduitId?: string;
  caveMouvementId?: string;
};

export const facturationApi = {
  listerClients: () => appelJson<{ clients: Client[] }>("/api/facturation/clients"),

  creerClient: (payload: { nom: string; profil: ProfilClient; email?: string; adresse?: string; codePostal?: string; ville?: string; siret?: string; tvaIntracommunautaire?: string }) =>
    appelJson<{ client: Client }>("/api/facturation/clients", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),

  listerDocuments: (filtres?: { type?: TypeDocumentFacturation; statut?: StatutDocument }) => {
    const params = new URLSearchParams();
    if (filtres?.type) params.set("type", filtres.type);
    if (filtres?.statut) params.set("statut", filtres.statut);
    const suffixe = params.toString();
    return appelJson<{ documents: DocumentFacturation[] }>(`/api/facturation/documents${suffixe ? `?${suffixe}` : ""}`);
  },

  obtenirDocument: (id: string) => appelJson<{ document: DocumentFacturation; lignes: LigneFacturation[] }>(`/api/facturation/documents/${id}`),

  creerDocument: (payload: { type: TypeDocumentFacturation; clientId?: string; lignes: LignePayload[]; dateEcheance?: string; observations?: string }) =>
    appelJson<{ document: DocumentFacturation }>("/api/facturation/documents", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),

  supprimerDocument: (id: string) => appelJson<{ ok: true }>(`/api/facturation/documents/${id}`, { method: "DELETE" }),

  emettreDocument: (id: string) => appelJson<{ document: DocumentFacturation }>(`/api/facturation/documents/${id}/emettre`, { method: "POST" }),

  transformerDocument: (id: string, versType: TypeDocumentFacturation) =>
    appelJson<{ document: DocumentFacturation }>(`/api/facturation/documents/${id}/transformer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ versType }),
    }),

  ventesComptoirDisponibles: () => appelJson<{ ventes: VenteComptoirDisponible[] }>("/api/facturation/ventes-comptoir-disponibles"),

  parametres: () => appelJson<{ parametres: ParametresLegaux | null }>("/api/facturation/parametres"),

  enregistrerParametres: (payload: Partial<ParametresLegaux>) =>
    appelJson<{ parametres: ParametresLegaux }>("/api/facturation/parametres", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),

  exportComptable: (mois: string) => appelJson<{ contenu: string; nomFichier: string }>(`/api/facturation/export-comptable?mois=${mois}`),
};

export const caisseApi = {
  verifierChaine: () => appelJson<{ valide: boolean; premiereAnomalie: number | null }>("/api/caisse/verifier"),
  listerClotures: () => appelJson<{ clotures: { id: string; type: string; periode: string; total_ttc: number; nombre_tickets: number; cree_le: string }[] }>("/api/caisse/clotures"),
  creerCloture: (type: "journaliere" | "mensuelle" | "annuelle", periode: string) =>
    appelJson<{ cloture: unknown }>("/api/caisse/clotures", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type, periode }),
    }),
};
