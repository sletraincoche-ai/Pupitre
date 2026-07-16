import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

const MODES_TARIFICATION = ["gratuit", "total", "par_personne"] as const;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const maj: Record<string, unknown> = {};
  if (typeof body.nom === "string") maj.nom = body.nom.trim();
  if (typeof body.description === "string") maj.description = body.description.trim() || null;
  if (body.dureeMinutes !== undefined) maj.duree_minutes = Number(body.dureeMinutes);
  if (body.capaciteMax !== undefined) maj.capacite_max = Number(body.capaciteMax);
  if (typeof body.archive === "boolean") maj.archive = body.archive;
  if ((MODES_TARIFICATION as readonly string[]).includes(body.modeTarification)) {
    maj.mode_tarification = body.modeTarification;
    // Le mode fait foi : on ne garde que le prix pertinent, jamais une
    // ancienne valeur orpheline de l'autre mode qui traînerait en base.
    maj.prix_par_personne = body.modeTarification === "par_personne" ? Number(body.prixParPersonne ?? 0) : 0;
    maj.prix_total = body.modeTarification === "total" ? Number(body.prixTotal ?? 0) : null;
  } else {
    if (body.prixParPersonne !== undefined) maj.prix_par_personne = Number(body.prixParPersonne);
    if (body.prixTotal !== undefined) maj.prix_total = Number(body.prixTotal);
  }

  const { data, error } = await supabaseAdmin.from("visites_formules").update(maj).eq("id", id).eq("user_id", user.id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ formule: data });
}
