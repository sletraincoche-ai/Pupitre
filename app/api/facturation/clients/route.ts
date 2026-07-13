import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { data, error } = await supabaseAdmin.from("clients").select("*").eq("user_id", user.id).order("nom", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ clients: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));
  const nom = typeof body.nom === "string" ? body.nom.trim() : "";
  const profil = typeof body.profil === "string" ? body.profil : "particulier";

  if (!nom) return NextResponse.json({ error: "Nom requis." }, { status: 400 });
  if (!["particulier", "professionnel", "chr"].includes(profil)) {
    return NextResponse.json({ error: "Profil invalide." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("clients")
    .insert({
      user_id: user.id,
      nom,
      profil,
      email: typeof body.email === "string" ? body.email : null,
      adresse: typeof body.adresse === "string" ? body.adresse : null,
      code_postal: typeof body.codePostal === "string" ? body.codePostal : null,
      ville: typeof body.ville === "string" ? body.ville : null,
      pays: typeof body.pays === "string" ? body.pays : "FR",
      siret: typeof body.siret === "string" ? body.siret : null,
      tva_intracommunautaire: typeof body.tvaIntracommunautaire === "string" ? body.tvaIntracommunautaire : null,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ client: data }, { status: 201 });
}
