import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";
import { getHistoriqueAchatsClient, getDocumentsClient, calculerStatsClient, calculerSegments } from "@/lib/clients-server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;

  const { data: client } = await supabaseAdmin.from("clients").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!client) return NextResponse.json({ error: "Client introuvable." }, { status: 404 });

  const [achats, documents] = await Promise.all([getHistoriqueAchatsClient(user.id, id), getDocumentsClient(user.id, id)]);
  const stats = calculerStatsClient(achats);
  const segments = calculerSegments(stats.dernierAchat, stats.montantTotal);

  return NextResponse.json({ client, achats, documents, stats, segments });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (!user) return response;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  if (typeof body.nom === "string") patch.nom = body.nom.trim();
  if (typeof body.profil === "string" && ["particulier", "professionnel", "chr"].includes(body.profil)) patch.profil = body.profil;
  if (typeof body.email === "string") patch.email = body.email;
  if (typeof body.telephone === "string") patch.telephone = body.telephone;
  if (typeof body.adresse === "string") patch.adresse = body.adresse;
  if (typeof body.codePostal === "string") patch.code_postal = body.codePostal;
  if (typeof body.ville === "string") patch.ville = body.ville;
  if (typeof body.pays === "string") patch.pays = body.pays;
  if (typeof body.siret === "string") patch.siret = body.siret;
  if (typeof body.tvaIntracommunautaire === "string") patch.tva_intracommunautaire = body.tvaIntracommunautaire;
  if (typeof body.origine === "string") patch.origine = body.origine;
  if (typeof body.notes === "string") patch.notes = body.notes;
  if (Array.isArray(body.tags)) patch.tags = body.tags;

  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "Aucun champ modifiable fourni." }, { status: 400 });

  const { data, error } = await supabaseAdmin.from("clients").update(patch).eq("id", id).eq("user_id", user.id).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Client introuvable." }, { status: 404 });

  return NextResponse.json({ client: data });
}
