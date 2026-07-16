import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";
import { getCapaciteRestante, ajouterVisite, VisiteError } from "@/lib/visites-server";

// Créneaux à venir avec capacité restante calculée à la volée — utilisé
// par l'onglet Configuration (liste des visites/créneaux) et par
// l'accueil du jour.
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

// "Ajouter une visite" (V2) — un seul geste : ouvrir le créneau et,
// si un nom ou une fiche client est donné, y rattacher immédiatement une
// réservation. Voir lib/visites-server.ts:ajouterVisite pour le détail
// (réservation par téléphone, groupe déjà convenu, ou créneau ouvert au
// public si le nom reste vide).
export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));

  try {
    const resultat = await ajouterVisite(user.id, {
      formuleId: typeof body.formuleId === "string" ? body.formuleId : "",
      date: typeof body.date === "string" ? body.date : "",
      heureDebut: typeof body.heureDebut === "string" ? body.heureDebut : "",
      heureFin: typeof body.heureFin === "string" ? body.heureFin : "",
      personnes: Number(body.personnes),
      visiteurNom: typeof body.visiteurNom === "string" ? body.visiteurNom : undefined,
      visiteurEmail: typeof body.visiteurEmail === "string" ? body.visiteurEmail : undefined,
      visiteurTelephone: typeof body.visiteurTelephone === "string" ? body.visiteurTelephone : undefined,
      clientId: typeof body.clientId === "string" ? body.clientId : undefined,
    });
    return NextResponse.json(resultat, { status: 201 });
  } catch (erreur) {
    if (erreur instanceof VisiteError) return NextResponse.json({ error: erreur.message }, { status: erreur.status });
    throw erreur;
  }
}
