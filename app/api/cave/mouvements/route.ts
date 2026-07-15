import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";
import { creerMouvementCave, MouvementCaveError } from "@/lib/cave-server";

export async function GET(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const mois = request.nextUrl.searchParams.get("mois"); // "AAAA-MM"
  const depuis = request.nextUrl.searchParams.get("depuis"); // "AAAA-MM-JJ", borne inférieure incluse, mutuellement exclusif avec mois

  let requete = supabaseAdmin
    .from("cave_mouvements")
    .select("*, cave_produits(nom, millesime)")
    .eq("user_id", user.id)
    .order("horodatage", { ascending: false });

  if (mois && /^\d{4}-\d{2}$/.test(mois)) {
    const debut = `${mois}-01`;
    const [annee, m] = mois.split("-").map(Number);
    const finExclue = new Date(Date.UTC(annee, m, 1)).toISOString().slice(0, 10);
    requete = requete.gte("horodatage", debut).lt("horodatage", finExclue);
  } else if (depuis && /^\d{4}-\d{2}-\d{2}$/.test(depuis)) {
    requete = requete.gte("horodatage", depuis);
  }

  const { data, error } = await requete;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ mouvements: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));

  try {
    const mouvement = await creerMouvementCave(user.id, user.identifiant, {
      produitId: typeof body.produitId === "string" ? body.produitId : "",
      type: body.type,
      quantiteBouteilles: Number(body.quantiteBouteilles),
      contenance: typeof body.contenance === "string" ? body.contenance : undefined,
      origine: typeof body.origine === "string" ? body.origine : undefined,
      clientId: typeof body.clientId === "string" ? body.clientId : undefined,
      clientNom: typeof body.clientNom === "string" ? body.clientNom : undefined,
      prixUnitaire: typeof body.prixUnitaire === "number" ? body.prixUnitaire : undefined,
      observations: typeof body.observations === "string" ? body.observations : undefined,
      compteCapsuleId: typeof body.compteCapsuleId === "string" ? body.compteCapsuleId : undefined,
      visiteId: typeof body.visiteId === "string" ? body.visiteId : undefined,
    });
    return NextResponse.json({ mouvement }, { status: 201 });
  } catch (erreur) {
    if (erreur instanceof MouvementCaveError) return NextResponse.json({ error: erreur.message }, { status: erreur.status });
    throw erreur;
  }
}
