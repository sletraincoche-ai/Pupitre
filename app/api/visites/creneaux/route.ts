import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";
import { getCapaciteRestante, creerCreneauPonctuel, VisiteError } from "@/lib/visites-server";

// Créneaux ponctuels réels — utilisé par l'onglet "Mes disponibilités"
// (section Créneau ponctuel) et par l'accueil du jour. Ne couvre pas les
// occurrences virtuelles des disponibilités récurrentes (voir
// /api/visites/disponibilites/recurrentes pour les règles elles-mêmes).
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
    .order("heure_debut", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const avecCapacite = await Promise.all(
    (creneaux ?? []).map(async (c) => {
      const { reservees, restante } = await getCapaciteRestante(c.id);
      return { ...c, reservees, restante };
    })
  );

  return NextResponse.json({ creneaux: avecCapacite });
}

// "Mes disponibilités" — créneau ponctuel : ouvre une disponibilité pour
// une date précise, sans aucun nom rattaché (action strictement séparée
// de "Nouvelle visite" — voir /api/visites/reservations).
export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));

  try {
    const creneau = await creerCreneauPonctuel(user.id, {
      formuleId: typeof body.formuleId === "string" ? body.formuleId : "",
      date: typeof body.date === "string" ? body.date : "",
      heureDebut: typeof body.heureDebut === "string" ? body.heureDebut : "",
      heureFin: typeof body.heureFin === "string" ? body.heureFin : "",
      capaciteMax: Number(body.capaciteMax),
    });
    return NextResponse.json({ creneau }, { status: 201 });
  } catch (erreur) {
    if (erreur instanceof VisiteError) return NextResponse.json({ error: erreur.message }, { status: erreur.status });
    throw erreur;
  }
}
