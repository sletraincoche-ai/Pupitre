import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";
import { prochainNumero, type TypeDocument } from "@/lib/facturation-numerotation";
import { creerMouvementCave, MouvementCaveError } from "@/lib/cave-server";

// Seuil au-delà duquel une facture/BL est jugée "significative" pour
// Agenda (grosse commande professionnelle) — même logique de seuil que
// Cave (SEUIL_PERTE_IMPORTANTE), ici sur le montant TTC plutôt que la
// quantité.
const SEUIL_MONTANT_SIGNIFICATIF = 500;

// L'émission est l'étape irréversible : numéro légal attribué (jamais
// modifiable ensuite), et — pour facture/bon_livraison uniquement,
// jamais devis/avoir — le stock Cave bouge réellement via
// creerMouvementCave, LA MÊME fonction que la saisie manuelle dans
// Cave (voir lib/cave-server.ts). Une ligne déjà reliée à un mouvement
// existant (transformation d'une vente comptoir, ou BL déjà émis
// transformé en facture) n'en recrée jamais un second.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;

  const { data: document } = await supabaseAdmin.from("facturation_documents").select("*, clients(nom, pays)").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!document) return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  if (document.statut !== "brouillon") {
    return NextResponse.json({ error: "Ce document a déjà été émis ou annulé." }, { status: 409 });
  }

  const { data: lignes } = await supabaseAdmin.from("facturation_lignes").select("*").eq("document_id", id).order("ordre", { ascending: true });

  const deplaceStock = document.type === "facture" || document.type === "bon_livraison";
  const typeMouvement = document.clients?.pays && document.clients.pays !== "FR" ? "export" : "vente_client";

  if (deplaceStock) {
    for (const ligne of lignes ?? []) {
      if (ligne.cave_mouvement_id || !ligne.cave_produit_id) continue; // déjà lié, ou ligne sans lien Cave (prestation, frais de port…)
      try {
        const mouvement = await creerMouvementCave(user.id, user.identifiant, {
          produitId: ligne.cave_produit_id,
          type: typeMouvement,
          quantiteBouteilles: Math.round(ligne.quantite),
          origine: document.type === "facture" ? "Facture" : "Bon de livraison",
          clientId: document.client_id ?? undefined,
          clientNom: document.client_nom_snapshot ?? undefined,
          prixUnitaire: ligne.prix_unitaire_ht,
        });
        await supabaseAdmin.from("facturation_lignes").update({ cave_mouvement_id: mouvement.id }).eq("id", ligne.id);
      } catch (erreur) {
        if (erreur instanceof MouvementCaveError) return NextResponse.json({ error: `Ligne "${ligne.designation}" : ${erreur.message}` }, { status: erreur.status });
        throw erreur;
      }
    }
  }

  const annee = new Date().getFullYear();
  const numero = await prochainNumero(user.id, document.type as TypeDocument, annee);

  const { data: documentEmis, error } = await supabaseAdmin
    .from("facturation_documents")
    .update({
      numero,
      statut: "emis",
      statut_paiement: document.type === "facture" ? "non_payee" : null,
      date_emission: new Date().toISOString().slice(0, 10),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (document.type === "facture" || document.type === "bon_livraison") {
    await supabaseAdmin.from("evenements").insert({
      user_id: user.id,
      type_evenement: `facturation.${document.type}`,
      date: new Date().toISOString().slice(0, 10),
      source: "facturation",
      payload: { document_id: id, numero, montant_ttc: document.total_ttc, client_nom: document.client_nom_snapshot },
      declenche_contenu: Number(document.total_ttc) >= SEUIL_MONTANT_SIGNIFICATIF,
    });

    // Événement distinct côté "clients" (chantier Clients) — une grosse
    // commande est un jalon de relation client, pas seulement un
    // événement comptable ; source: "clients" pour qu'Agenda/Studio IA
    // puisse le traiter différemment d'une simple émission de facture.
    if (document.client_id && Number(document.total_ttc) >= SEUIL_MONTANT_SIGNIFICATIF) {
      await supabaseAdmin.from("evenements").insert({
        user_id: user.id,
        type_evenement: "clients.grosse_commande",
        date: new Date().toISOString().slice(0, 10),
        source: "clients",
        payload: { client_id: document.client_id, client_nom: document.client_nom_snapshot, document_id: id, montant_ttc: document.total_ttc },
        declenche_contenu: true,
      });
    }
  }

  return NextResponse.json({ document: documentEmis });
}
