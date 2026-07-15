import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { data, error } = await supabaseAdmin
    .from("visites_formules")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ formules: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));
  const nom = typeof body.nom === "string" ? body.nom.trim() : "";
  const dureeMinutes = Number(body.dureeMinutes);
  const prixParPersonne = Number(body.prixParPersonne);
  const capaciteMax = Number(body.capaciteMax);

  if (!nom) return NextResponse.json({ error: "Nom requis." }, { status: 400 });
  if (!Number.isInteger(dureeMinutes) || dureeMinutes <= 0) return NextResponse.json({ error: "Durée invalide." }, { status: 400 });
  if (!Number.isFinite(prixParPersonne) || prixParPersonne < 0) return NextResponse.json({ error: "Prix invalide." }, { status: 400 });
  if (!Number.isInteger(capaciteMax) || capaciteMax <= 0) return NextResponse.json({ error: "Capacité invalide." }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("visites_formules")
    .insert({
      user_id: user.id,
      nom,
      description: typeof body.description === "string" ? body.description.trim() || null : null,
      duree_minutes: dureeMinutes,
      prix_par_personne: prixParPersonne,
      capacite_max: capaciteMax,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ formule: data }, { status: 201 });
}
