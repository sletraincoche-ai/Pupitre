import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";
import { calculerTotaux } from "@/lib/facturation-server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;

  const { data: document } = await supabaseAdmin
    .from("facturation_documents")
    .select("*, clients(nom, profil, email)")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!document) return NextResponse.json({ error: "Document introuvable." }, { status: 404 });

  const { data: lignes } = await supabaseAdmin.from("facturation_lignes").select("*").eq("document_id", id).order("ordre", { ascending: true });

  return NextResponse.json({ document, lignes: lignes ?? [] });
}

// Modifiable UNIQUEMENT en brouillon — un document émis est immuable
// (RG légale numérotation/mentions, voir recherche réglementaire). Pour
// corriger un document émis : créer un avoir qui le référence, jamais
// le réécrire.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;

  const { data: document } = await supabaseAdmin.from("facturation_documents").select("statut").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!document) return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  if (document.statut !== "brouillon") {
    return NextResponse.json({ error: "Seul un document en brouillon peut être modifié." }, { status: 409 });
  }

  const body = await request.json().catch(() => ({}));
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.observations === "string") patch.observations = body.observations;
  if (typeof body.dateEcheance === "string") patch.date_echeance = body.dateEcheance;
  if (typeof body.modePaiement === "string") patch.mode_paiement = body.modePaiement;

  if (Array.isArray(body.lignes)) {
    await supabaseAdmin.from("facturation_lignes").delete().eq("document_id", id);
    const lignes = body.lignes.map((l: Record<string, unknown>, index: number) => ({
      document_id: id,
      designation: String(l.designation ?? ""),
      quantite: Number(l.quantite),
      unite: typeof l.unite === "string" ? l.unite : "C62",
      prix_unitaire_ht: Number(l.prixUnitaireHt),
      taux_tva: l.tauxTva !== undefined ? Number(l.tauxTva) : 20,
      montant_ht: Math.round(Number(l.quantite) * Number(l.prixUnitaireHt) * 100) / 100,
      cave_produit_id: typeof l.caveProduitId === "string" ? l.caveProduitId : null,
      cave_mouvement_id: typeof l.caveMouvementId === "string" ? l.caveMouvementId : null,
      ordre: index,
    }));
    const { error: erreurLignes } = await supabaseAdmin.from("facturation_lignes").insert(lignes);
    if (erreurLignes) return NextResponse.json({ error: erreurLignes.message }, { status: 500 });

    const { totalHt, totalTva, totalTtc } = calculerTotaux(
      lignes.map((l: { quantite: number; prix_unitaire_ht: number; taux_tva: number }) => ({
        quantite: l.quantite,
        prixUnitaireHt: l.prix_unitaire_ht,
        tauxTva: l.taux_tva,
      }))
    );
    patch.total_ht = totalHt;
    patch.total_tva = totalTva;
    patch.total_ttc = totalTtc;
  }

  const { data, error } = await supabaseAdmin.from("facturation_documents").update(patch).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ document: data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;

  const { data: document } = await supabaseAdmin.from("facturation_documents").select("statut").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!document) return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  if (document.statut !== "brouillon") {
    return NextResponse.json({ error: "Seul un brouillon peut être supprimé — un document émis reste dans le registre (voir avoir)." }, { status: 409 });
  }

  await supabaseAdmin.from("facturation_documents").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
