import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";
import { genererXmlDti, DrmValidationError } from "@/lib/cave-export";

function periodeValide(periode: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(periode);
}

// Régénère et écrase le XML tant que le statut reste "brouillon"/"genere"
// — une fois "depose", la déclaration est figée (elle a servi d'ancre de
// continuité RG9-12 pour le mois suivant si celui-ci a déjà été généré).
export async function POST(request: NextRequest, { params }: { params: Promise<{ periode: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { periode } = await params;
  if (!periodeValide(periode)) return NextResponse.json({ error: "Période invalide (attendu AAAA-MM)." }, { status: 400 });

  const { data: existante } = await supabaseAdmin
    .from("cave_drm_declarations")
    .select("statut")
    .eq("user_id", user.id)
    .eq("periode", periode)
    .maybeSingle();
  if (existante?.statut === "depose") {
    return NextResponse.json({ error: "Cette déclaration a déjà été déposée sur CIEL — elle ne peut plus être régénérée." }, { status: 409 });
  }

  try {
    const { xml, snapshot } = await genererXmlDti(user.id, periode);

    const { error } = await supabaseAdmin.from("cave_drm_declarations").upsert(
      {
        user_id: user.id,
        periode,
        statut: "genere",
        xml,
        stocks_fin_periode: snapshot,
        genere_le: new Date().toISOString(),
      },
      // La contrainte unique porte sur (user_id, periode), pas sur la
      // clé primaire (id) — sans onConflict explicite, PostgREST tente
      // un INSERT et échoue sur cette contrainte au lieu de faire
      // l'UPDATE attendu quand une déclaration existe déjà pour ce mois.
      { onConflict: "user_id,periode" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ xml, periode });
  } catch (erreur) {
    if (erreur instanceof DrmValidationError) return NextResponse.json({ error: erreur.message }, { status: 422 });
    throw erreur;
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ periode: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { periode } = await params;

  const { data } = await supabaseAdmin
    .from("cave_drm_declarations")
    .select("xml, statut, genere_le, depose_le")
    .eq("user_id", user.id)
    .eq("periode", periode)
    .maybeSingle();
  if (!data?.xml) return NextResponse.json({ error: "Aucun export généré pour cette période." }, { status: 404 });

  return NextResponse.json(data);
}

// Marque la déclaration comme déposée sur CIEL — fige définitivement
// l'ancre de continuité pour le mois suivant.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ periode: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { periode } = await params;

  const { data, error } = await supabaseAdmin
    .from("cave_drm_declarations")
    .update({ statut: "depose", depose_le: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("periode", periode)
    .eq("statut", "genere")
    .select("periode")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Aucune déclaration générée à marquer comme déposée pour cette période." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
