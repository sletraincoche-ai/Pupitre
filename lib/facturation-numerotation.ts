import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type TypeDocument = "facture" | "avoir" | "devis" | "bon_livraison";

const PREFIXES: Record<TypeDocument, string> = {
  facture: "FA",
  avoir: "AV",
  devis: "DE",
  bon_livraison: "BL",
};

// Numérotation légale : séquence CHRONOLOGIQUE et CONTINUE, propre à
// CHAQUE (utilisateur, type de document, année) — jamais un compteur
// partagé entre redevables ni entre types (confirmé BOFiP
// BOI-TVA-DECLA-30-20-20-10, recherche menée le 13/07/2026). La remise
// à zéro annuelle est autorisée, jamais en cours d'année.
//
// L'incrémentation utilise UPSERT ... ON CONFLICT DO UPDATE ... RETURNING
// en une seule requête atomique : deux créations concurrentes ne
// peuvent jamais obtenir le même numéro (contrairement à un
// SELECT-puis-UPDATE qui serait sujet à une race condition).
export async function prochainNumero(userId: string, type: TypeDocument, annee: number): Promise<string> {
  const { data, error } = await supabaseAdmin.rpc("facturation_prochain_numero", {
    p_user_id: userId,
    p_type: type,
    p_annee: annee,
  });
  if (error) throw new Error(error.message);

  const numero = data as number;
  return `${PREFIXES[type]}-${annee}-${String(numero).padStart(4, "0")}`;
}
