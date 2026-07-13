// Client léger pour les routes /api/cave/* — pas de contexte global
// (contrairement à lib/cave-context.tsx, qui reste le mock utilisé
// ailleurs dans l'app, voir app/dashboard/cave/page.tsx pour le détail
// de cette séparation) : chaque écran Cave réel récupère/mute ses
// propres données via ces fonctions, appelées depuis useEffect/handlers.

export type Produit = {
  id: string;
  nom: string;
  millesime: string | null;
  libelle_personnalise: string;
  libelle_fiscal: string | null;
  code_inao: string | null;
  tav: number | null;
  premix: boolean;
  contenance_defaut: string;
  prix_vente_defaut: number | null;
  archive: boolean;
};

export type TypeMouvement =
  | "tirage"
  | "degorgement"
  | "vente_comptoir"
  | "vente_client"
  | "export"
  | "perte"
  | "entree_acquitte";

export type Mouvement = {
  id: string;
  produit_id: string;
  type: TypeMouvement;
  regime: "suspendu" | "acquitte";
  quantite_bouteilles: number;
  contenance: string;
  origine: string;
  client_id: string | null;
  client_nom: string | null;
  prix_unitaire: number | null;
  montant: number | null;
  observations: string | null;
  auteur: string;
  horodatage: string;
  annule: boolean;
  annule_le: string | null;
  annule_par: string | null;
  motif_annulation: string | null;
  cave_produits?: { nom: string; millesime: string | null };
};

export type LigneStock = {
  produitId: string;
  nom: string;
  millesime: string | null;
  archive: boolean;
  stockBouteilles: number;
  stockHl: number;
};

async function appelJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Erreur inconnue.");
  return data as T;
}

export const caveApi = {
  listerProduits: () => appelJson<{ produits: Produit[] }>("/api/cave/produits"),

  creerProduit: (payload: {
    nom: string;
    millesime?: string;
    libellePersonnalise: string;
    libelleFiscal?: string;
    codeInao?: string;
    tav?: number;
    premix?: boolean;
    contenanceDefaut?: string;
    prixVenteDefaut?: number;
  }) =>
    appelJson<{ produit: Produit }>("/api/cave/produits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),

  modifierProduit: (
    id: string,
    payload: Partial<{ nom: string; millesime: string; tav: number; premix: boolean; contenanceDefaut: string; prixVenteDefaut: number; archive: boolean }>
  ) =>
    appelJson<{ produit: Produit }>(`/api/cave/produits/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),

  // mois ("AAAA-MM") et depuis ("AAAA-MM-JJ", borne inférieure incluse,
  // sans borne supérieure) sont mutuellement exclusifs — voir la vue
  // Semaine/Mois du registre dans app/dashboard/cave/page.tsx.
  listerMouvements: (options?: { mois?: string; depuis?: string }) => {
    const params = new URLSearchParams();
    if (options?.mois) params.set("mois", options.mois);
    if (options?.depuis) params.set("depuis", options.depuis);
    const suffixe = params.toString();
    return appelJson<{ mouvements: Mouvement[] }>(`/api/cave/mouvements${suffixe ? `?${suffixe}` : ""}`);
  },

  annulerMouvement: (id: string, motif: string) =>
    appelJson<{ mouvement: Mouvement }>(`/api/cave/mouvements/${id}/annuler`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ motif }),
    }),

  creerMouvement: (payload: {
    produitId: string;
    type: TypeMouvement;
    quantiteBouteilles: number;
    contenance?: string;
    origine?: string;
    clientId?: string;
    clientNom?: string;
    prixUnitaire?: number;
    observations?: string;
    compteCapsuleId?: string;
  }) =>
    appelJson<{ mouvement: Mouvement }>("/api/cave/mouvements", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),

  stock: () => appelJson<{ stock: LigneStock[] }>("/api/cave/stock"),

  listerComptesCapsules: () => appelJson<{ comptes: { id: string; categorie_fiscale: string; type_capsule: string; centilisation: string }[] }>("/api/cave/capsules"),

  creerMouvementCapsules: (compteId: string, payload: { type: "achat" | "retour" | "excedent" | "autre_entree"; quantite: number; observations?: string }) =>
    appelJson<{ mouvement: unknown }>(`/api/cave/capsules/${compteId}/mouvements`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),

  genererDrm: (periode: string) =>
    appelJson<{ xml: string; periode: string }>(`/api/cave/drm/${periode}`, { method: "POST" }),

  telechargerDrm: (periode: string) =>
    appelJson<{ xml: string; statut: string; genere_le: string; depose_le: string | null }>(`/api/cave/drm/${periode}`),

  listerDeclarations: () =>
    appelJson<{ declarations: { periode: string; statut: string; genere_le: string | null; depose_le: string | null }[] }>("/api/cave/drm"),

  marquerDepose: (periode: string) => appelJson<{ ok: true }>(`/api/cave/drm/${periode}`, { method: "PATCH" }),

  parametres: () => appelJson<{ numeroAgrement: string | null }>("/api/cave/parametres"),

  enregistrerNumeroAgrement: (numeroAgrement: string) =>
    appelJson<{ ok: true; numeroAgrement: string }>("/api/cave/parametres", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ numeroAgrement }),
    }),
};
