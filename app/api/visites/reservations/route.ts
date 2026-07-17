import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";
import { creerNouvelleVisite, VisiteError } from "@/lib/visites-server";

// Liste du jour (accueil) — ?date=AAAA-MM-JJ, défaut aujourd'hui.
export async function GET(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const date = request.nextUrl.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

  const { data, error } = await supabaseAdmin
    .from("visites_reservations")
    .select("*, visites_formules(nom, duree_minutes), cave_mouvements(id, montant, quantite_bouteilles)")
    .eq("user_id", user.id)
    .eq("date", date)
    .order("heure_debut", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ reservations: data ?? [] });
}

// "Nouvelle visite" (V3) — le viticulteur programme lui-même une
// visite, confirmée immédiatement (jamais depuis la page publique, qui
// passe par /api/public/visites/reserver et naît en_attente).
export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));

  try {
    const reservation = await creerNouvelleVisite(user.id, {
      formuleId: typeof body.formuleId === "string" ? body.formuleId : "",
      date: typeof body.date === "string" ? body.date : new Date().toISOString().slice(0, 10),
      heureDebut: typeof body.heureDebut === "string" ? body.heureDebut : new Date().toTimeString().slice(0, 5),
      heureFin: typeof body.heureFin === "string" ? body.heureFin : undefined,
      personnes: Number(body.personnes),
      visiteurNom: typeof body.visiteurNom === "string" ? body.visiteurNom : undefined,
      visiteurEmail: typeof body.visiteurEmail === "string" ? body.visiteurEmail : undefined,
      visiteurTelephone: typeof body.visiteurTelephone === "string" ? body.visiteurTelephone : undefined,
      clientId: typeof body.clientId === "string" ? body.clientId : undefined,
    });
    return NextResponse.json({ reservation }, { status: 201 });
  } catch (erreur) {
    if (erreur instanceof VisiteError) return NextResponse.json({ error: erreur.message }, { status: erreur.status });
    throw erreur;
  }
}
