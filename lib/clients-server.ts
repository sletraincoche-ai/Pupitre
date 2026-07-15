import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Historique d'achats réel — lu depuis le registre de Cave existant
// (cave_mouvements), jamais dupliqué dans une table parallèle (brief
// explicite). Seuls vente_client/export portent un client_id : la
// vente comptoir reste volontairement sans identité (principe fondateur
// déjà appliqué dans Cave), donc n'apparaît jamais ici — conforme au
// brief ("l'association reste toujours facultative").
export async function getHistoriqueAchatsClient(userId: string, clientId: string) {
  const { data, error } = await supabaseAdmin
    .from("cave_mouvements")
    .select("id, type, quantite_bouteilles, montant, horodatage, annule, cave_produits(nom, millesime)")
    .eq("user_id", userId)
    .eq("client_id", clientId)
    .eq("annule", false)
    .in("type", ["vente_client", "export"])
    .order("horodatage", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

// Documents Facturation pour ce client — liste informative séparée,
// jamais sommée avec les achats Cave ci-dessus : une facture émise a
// déjà créé son propre mouvement de cave (même montant), les additionner
// compterait deux fois la même vente.
export async function getDocumentsClient(userId: string, clientId: string) {
  const { data, error } = await supabaseAdmin
    .from("facturation_documents")
    .select("id, type, numero, statut, date_emission, total_ttc, created_at")
    .eq("user_id", userId)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export type StatsClient = {
  dernierAchat: string | null;
  montantTotal: number;
  nombreAchats: number;
  bouteillesAchetees: number;
};

export function calculerStatsClient(mouvements: { montant: number | null; quantite_bouteilles: number; horodatage: string }[]): StatsClient {
  if (mouvements.length === 0) return { dernierAchat: null, montantTotal: 0, nombreAchats: 0, bouteillesAchetees: 0 };
  return {
    dernierAchat: mouvements[0].horodatage, // déjà trié desc par l'appelant
    montantTotal: mouvements.reduce((total, m) => total + (m.montant ?? 0), 0),
    nombreAchats: mouvements.length,
    bouteillesAchetees: mouvements.reduce((total, m) => total + m.quantite_bouteilles, 0),
  };
}

// Segmentation automatique — règles simples et transparentes (pas un
// algorithme opaque, exigence explicite du brief) : deux axes
// indépendants, récence ET poids, jamais un score composite illisible.
// Seuils documentés ici et affichés tels quels côté UI.
export const SEUIL_ACTIF_JOURS = 90;
export const SEUIL_OCCASIONNEL_JOURS = 180;
export const SEUIL_GROS_ACHETEUR_EUR = 500;

export function calculerSegments(dernierAchat: string | null, montantTotal: number): string[] {
  const segments: string[] = [];

  if (!dernierAchat) {
    segments.push("Nouveau");
  } else {
    const joursEcoules = Math.floor((Date.now() - new Date(dernierAchat).getTime()) / 86_400_000);
    if (joursEcoules <= SEUIL_ACTIF_JOURS) segments.push("Actif");
    else if (joursEcoules <= SEUIL_OCCASIONNEL_JOURS) segments.push("Occasionnel");
    else segments.push(`Inactif depuis ${Math.floor(joursEcoules / 30)} mois`);
  }

  if (montantTotal >= SEUIL_GROS_ACHETEUR_EUR) segments.push("Gros acheteur");

  return segments;
}

// Événement Agenda — un client qui bascule en inactif. Appelé depuis
// GET /api/clients (point de passage naturel, pas de cron dans ce
// projet) avec une garde anti-doublon : ne réémet pas si un événement
// équivalent existe déjà dans les 30 derniers jours pour ce client.
export async function signalerClientInactifSiNouveau(userId: string, clientId: string, clientNom: string, segments: string[]): Promise<void> {
  const estInactif = segments.some((s) => s.startsWith("Inactif"));
  if (!estInactif) return;

  const depuis = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { data: existant } = await supabaseAdmin
    .from("evenements")
    .select("id")
    .eq("user_id", userId)
    .eq("type_evenement", "clients.inactif")
    .gte("created_at", depuis)
    .contains("payload", { client_id: clientId })
    .maybeSingle();
  if (existant) return;

  await supabaseAdmin.from("evenements").insert({
    user_id: userId,
    type_evenement: "clients.inactif",
    date: new Date().toISOString().slice(0, 10),
    source: "clients",
    payload: { client_id: clientId, client_nom: clientNom },
    declenche_contenu: false,
  });
}
