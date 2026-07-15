import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";
import { getCapaciteRestante } from "@/lib/visites-server";

// Créneaux à venir avec capacité restante calculée à la volée — utilisé
// par l'onglet Configuration (liste des créneaux ouverts) et par
// l'accueil du jour (attribution d'un créneau à un walk-in).
export async function GET(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const depuis = request.nextUrl.searchParams.get("depuis") ?? new Date().toISOString().slice(0, 10);

  const { data: creneaux, error } = await supabaseAdmin
    .from("visites_creneaux")
    .select("*, visites_formules(nom)")
    .eq("user_id", user.id)
    .gte("date", depuis)
    .order("date", { ascending: true })
    .order("heure", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const avecCapacite = await Promise.all(
    (creneaux ?? []).map(async (c) => {
      const { reservees, restante } = await getCapaciteRestante(c.id);
      return { ...c, reservees, restante };
    })
  );

  return NextResponse.json({ creneaux: avecCapacite });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));
  const formuleId = typeof body.formuleId === "string" ? body.formuleId : "";
  const date = typeof body.date === "string" ? body.date : "";
  const heure = typeof body.heure === "string" ? body.heure : "";

  if (!formuleId || !date || !heure) return NextResponse.json({ error: "Formule, date et heure requises." }, { status: 400 });

  const { data: formule } = await supabaseAdmin.from("visites_formules").select("capacite_max").eq("id", formuleId).eq("user_id", user.id).maybeSingle();
  if (!formule) return NextResponse.json({ error: "Formule introuvable." }, { status: 404 });

  const capaciteMax = body.capaciteMax !== undefined ? Number(body.capaciteMax) : formule.capacite_max;
  if (!Number.isInteger(capaciteMax) || capaciteMax <= 0) return NextResponse.json({ error: "Capacité invalide." }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("visites_creneaux")
    .insert({ user_id: user.id, formule_id: formuleId, date, heure, capacite_max: capaciteMax })
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Un créneau existe déjà pour cette formule à cette date et heure." }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ creneau: data }, { status: 201 });
}
