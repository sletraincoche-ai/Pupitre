import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Caisse conforme loi anti-fraude TVA (CGI art. 286 I 3° bis, principe
// ISCA — Inaltérabilité, Sécurisation, Conservation, Archivage,
// recherche menée le 13/07/2026). Un ticket est créé pour CHAQUE vente
// comptoir, chaîné cryptographiquement au précédent via une fonction
// Postgres (caisse_creer_ticket) — jamais calculé côté application,
// pour garantir l'atomicité (voir schema.sql). Aucune fonction
// d'update/delete n'existe volontairement dans ce fichier : un ticket,
// une fois créé, ne peut plus être modifié.
export async function creerTicketCaisse(userId: string, mouvementId: string, montantTtc: number) {
  const { data, error } = await supabaseAdmin
    .rpc("caisse_creer_ticket", { p_user_id: userId, p_mouvement_id: mouvementId, p_montant_ttc: montantTtc })
    .single();
  if (error) throw new Error(error.message);
  return data as { numero_ticket: number; hash: string; hash_precedent: string | null; horodatage: string };
}

// La vérification recalcule les hashs via caisse_verifier_chaine (SQL),
// pas en JavaScript — recalculer ici exposerait au risque qu'un
// formatage ::text différent entre Postgres et JS (numeric, timestamptz)
// fasse échouer la comparaison sur des données pourtant intactes.
export async function verifierChaineCaisse(userId: string): Promise<{ valide: boolean; premiereAnomalie: number | null }> {
  const { data, error } = await supabaseAdmin.rpc("caisse_verifier_chaine", { p_user_id: userId }).single();
  if (error) throw new Error(error.message);
  const resultat = data as { valide: boolean; premiere_anomalie: number | null };
  return { valide: resultat.valide, premiereAnomalie: resultat.premiere_anomalie };
}

function bornesPeriode(type: "journaliere" | "mensuelle" | "annuelle", periode: string): { debut: string; finExclue: string } {
  if (type === "journaliere") {
    const fin = new Date(`${periode}T00:00:00.000Z`);
    fin.setUTCDate(fin.getUTCDate() + 1);
    return { debut: `${periode}T00:00:00.000Z`, finExclue: fin.toISOString() };
  }
  if (type === "mensuelle") {
    const [annee, mois] = periode.split("-").map(Number);
    return {
      debut: new Date(Date.UTC(annee, mois - 1, 1)).toISOString(),
      finExclue: new Date(Date.UTC(annee, mois, 1)).toISOString(),
    };
  }
  const annee = Number(periode);
  return { debut: new Date(Date.UTC(annee, 0, 1)).toISOString(), finExclue: new Date(Date.UTC(annee + 1, 0, 1)).toISOString() };
}

// Clôture cumulative (exigence de conservation ISCA) — exige que la
// chaîne soit valide AVANT de clôturer (une clôture sur une chaîne déjà
// altérée n'aurait aucune valeur probante). hash_cloture inclut le hash
// du dernier ticket de la période : la clôture reste elle-même
// vérifiable contre la chaîne de tickets, pas une simple somme
// déclarative.
export async function creerCloture(userId: string, type: "journaliere" | "mensuelle" | "annuelle", periode: string) {
  const { valide } = await verifierChaineCaisse(userId);
  if (!valide) throw new Error("La chaîne de tickets est invalide — clôture refusée tant que l'anomalie n'est pas identifiée.");

  const { debut, finExclue } = bornesPeriode(type, periode);
  const { data: tickets, error } = await supabaseAdmin
    .from("caisse_tickets")
    .select("montant_ttc, hash")
    .eq("user_id", userId)
    .gte("horodatage", debut)
    .lt("horodatage", finExclue)
    .order("numero_ticket", { ascending: true });
  if (error) throw new Error(error.message);

  const totalTtc = (tickets ?? []).reduce((total, t) => total + Number(t.montant_ttc), 0);
  const dernierHash = tickets && tickets.length > 0 ? tickets[tickets.length - 1].hash : null;
  const { createHash } = await import("node:crypto");
  const hashCloture = createHash("sha256")
    .update(`${userId}|${type}|${periode}|${totalTtc.toFixed(2)}|${tickets?.length ?? 0}|${dernierHash ?? ""}`)
    .digest("hex");

  const { data: cloture, error: erreurInsert } = await supabaseAdmin
    .from("caisse_clotures")
    .upsert(
      { user_id: userId, type, periode, total_ttc: totalTtc, nombre_tickets: tickets?.length ?? 0, hash_cloture: hashCloture },
      { onConflict: "user_id,type,periode" }
    )
    .select("*")
    .single();
  if (erreurInsert) throw new Error(erreurInsert.message);
  return cloture;
}
