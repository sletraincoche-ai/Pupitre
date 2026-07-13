import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Génère un export comptable au format FEC officiel (art. A47 A-1 LPF,
// recherche réglementaire menée le 13/07/2026 — 18 colonnes exactes,
// séparateur pipe, dates AAAAMMJJ, en-tête obligatoire en première
// ligne). Une ligne d'écriture par mouvement de compte (client, vente,
// TVA), jamais une ligne par facture — une facture TTC génère donc
// plusieurs lignes FEC en partie double.
//
// Comptes du Plan Comptable Général utilisés (par défaut, à ajuster par
// l'expert-comptable à l'import — les logiciels cibles Sage/EBP/Cegid/
// Isacompta permettent tous un remappage) : 411000 Clients, 707000
// Ventes de marchandises, 44571 TVA collectée. Un vigneron vendant sa
// propre production relèverait plutôt du 701 (produits finis) — laissé
// en 707 pour rester le compte le plus universellement reconnu par les
// imports tiers en V1, ajustable ensuite.
const COMPTE_CLIENT = "411000";
const COMPTE_VENTE = "707000";
const COMPTE_TVA_COLLECTEE = "44571";
const LIBELLE_COMPTE_CLIENT = "Clients";
const LIBELLE_COMPTE_VENTE = "Ventes de marchandises";
const LIBELLE_COMPTE_TVA = "TVA collectée";

const COLONNES = [
  "JournalCode",
  "JournalLib",
  "EcritureNum",
  "EcritureDate",
  "CompteNum",
  "CompteLib",
  "CompAuxNum",
  "CompAuxLib",
  "PieceRef",
  "PieceDate",
  "EcritureLib",
  "Debit",
  "Credit",
  "EcritureLet",
  "DateLet",
  "ValidDate",
  "Montantdevise",
  "Idevise",
] as const;

type LigneFec = Record<(typeof COLONNES)[number], string>;

function dateFec(iso: string): string {
  return iso.replaceAll("-", "");
}

function montantFec(valeur: number): string {
  return valeur.toFixed(2);
}

// Code auxiliaire client stable et court — dérivé de l'id (les 8
// premiers caractères suffisent à distinguer les clients réels d'un
// même domaine, jamais réutilisés en dehors de cet export).
function compteAuxiliaireClient(clientId: string | null): string {
  return clientId ? `CLI${clientId.replace(/-/g, "").slice(0, 8).toUpperCase()}` : "CLIDIVERS";
}

export async function genererFec(userId: string, siren: string, debut: string, finExclue: string): Promise<{ contenu: string; nomFichier: string }> {
  const { data: documents, error } = await supabaseAdmin
    .from("facturation_documents")
    .select("*")
    .eq("user_id", userId)
    .in("type", ["facture", "avoir"])
    .eq("statut", "emis")
    .gte("date_emission", debut)
    .lt("date_emission", finExclue)
    .order("numero", { ascending: true });
  if (error) throw new Error(error.message);

  const lignes: LigneFec[] = [];
  let ecritureNum = 1;

  for (const doc of documents ?? []) {
    const dateEcriture = dateFec(doc.date_emission);
    const pieceRef = doc.numero ?? "";
    const compAuxNum = compteAuxiliaireClient(doc.client_id);
    const compAuxLib = doc.client_nom_snapshot ?? "Client";
    const libelle = `${doc.type === "avoir" ? "Avoir" : "Facture"} ${pieceRef} — ${compAuxLib}`;
    const numeroEcriture = String(ecritureNum++).padStart(6, "0");

    // Un avoir inverse le sens débit/crédit d'une facture normale —
    // même structure de 3 lignes, montants en miroir.
    const estAvoir = doc.type === "avoir";
    const totalTtc = Number(doc.total_ttc);
    const totalHt = Number(doc.total_ht);
    const totalTva = Number(doc.total_tva);

    const base: Omit<LigneFec, "CompteNum" | "CompteLib" | "Debit" | "Credit"> = {
      JournalCode: "VE",
      JournalLib: "Journal des ventes",
      EcritureNum: numeroEcriture,
      EcritureDate: dateEcriture,
      CompAuxNum: compAuxNum,
      CompAuxLib: compAuxLib,
      PieceRef: pieceRef,
      PieceDate: dateEcriture,
      EcritureLib: libelle,
      EcritureLet: "",
      DateLet: "",
      ValidDate: dateEcriture,
      Montantdevise: "",
      Idevise: "",
    };

    lignes.push({
      ...base,
      CompteNum: COMPTE_CLIENT,
      CompteLib: LIBELLE_COMPTE_CLIENT,
      Debit: estAvoir ? "" : montantFec(totalTtc),
      Credit: estAvoir ? montantFec(totalTtc) : "",
    });
    lignes.push({
      ...base,
      CompteNum: COMPTE_VENTE,
      CompteLib: LIBELLE_COMPTE_VENTE,
      Debit: estAvoir ? montantFec(totalHt) : "",
      Credit: estAvoir ? "" : montantFec(totalHt),
    });
    if (totalTva > 0) {
      lignes.push({
        ...base,
        CompteNum: COMPTE_TVA_COLLECTEE,
        CompteLib: LIBELLE_COMPTE_TVA,
        Debit: estAvoir ? montantFec(totalTva) : "",
        Credit: estAvoir ? "" : montantFec(totalTva),
      });
    }
  }

  const entetes = COLONNES.join("|");
  const corps = lignes.map((l) => COLONNES.map((c) => l[c]).join("|")).join("\r\n");
  const contenu = `${entetes}\r\n${corps}`;

  // Nomenclature imposée : SirenFECAAAAMMJJ.txt, AAAAMMJJ = date de
  // clôture de l'exercice — ici la borne de fin de période demandée.
  const dateFichier = dateFec(new Date(new Date(finExclue).getTime() - 86400000).toISOString().slice(0, 10));
  const nomFichier = `${siren}FEC${dateFichier}.txt`;

  return { contenu, nomFichier };
}
