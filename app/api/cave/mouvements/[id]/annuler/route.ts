import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

// Corrige une erreur de saisie SANS jamais supprimer ni réécrire le
// mouvement d'origine (traçabilité totale, exigence explicite du
// chantier) : le mouvement reste dans le registre, marqué annulé, avec
// qui/quand/pourquoi. Exclu ensuite du stock et des balances DTI+ (voir
// lib/cave-server.ts, lib/cave-export.ts). Pour corriger une quantité,
// l'utilisateur annule ce mouvement puis en saisit un nouveau, correct.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const motif = typeof body.motif === "string" ? body.motif.trim() : "";
  if (!motif) return NextResponse.json({ error: "Un motif d'annulation est requis." }, { status: 400 });

  const { data: mouvement } = await supabaseAdmin
    .from("cave_mouvements")
    .select("id, annule")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!mouvement) return NextResponse.json({ error: "Mouvement introuvable." }, { status: 404 });
  if (mouvement.annule) return NextResponse.json({ error: "Ce mouvement est déjà annulé." }, { status: 409 });

  const maintenant = new Date().toISOString();

  const { data: annule, error } = await supabaseAdmin
    .from("cave_mouvements")
    .update({ annule: true, annule_le: maintenant, annule_par: user.identifiant, motif_annulation: motif })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Cascade : une consommation de capsule déclenchée par ce mouvement
  // (dégorgement) doit être annulée avec lui, sinon le compte-crd
  // resterait faussé même après correction du mouvement bouteille.
  await supabaseAdmin.from("cave_capsules_mouvements").update({ annule: true }).eq("mouvement_id", id).eq("annule", false);

  return NextResponse.json({ mouvement: annule });
}
