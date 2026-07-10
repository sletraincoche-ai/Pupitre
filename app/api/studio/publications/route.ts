import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";
import { formatDateFr, type PublicationReelle } from "@/lib/publications";

type Row = {
  id: string;
  plateforme: string;
  format: string;
  statut: string;
  legende: string;
  hashtags: string[];
  musique: string | null;
  photos: string[];
  scheduled_for: string | null;
  created_at: string;
  updated_at: string;
};

function versPublication(r: Row): PublicationReelle {
  return {
    id: r.id,
    plateforme: r.plateforme as PublicationReelle["plateforme"],
    format: r.format as PublicationReelle["format"],
    statut: r.statut as PublicationReelle["statut"],
    photos: r.photos ?? [],
    legende: r.legende,
    hashtags: r.hashtags ?? [],
    musique: r.musique ?? undefined,
    scheduledFor: r.scheduled_for ?? undefined,
    date: formatDateFr(r.scheduled_for ?? r.updated_at),
  };
}

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { data, error } = await supabaseAdmin
    .from("publications")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ publications: (data ?? []).map(versPublication) });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));
  const { data, error } = await supabaseAdmin
    .from("publications")
    .insert({
      user_id: user.id,
      plateforme: body.plateforme,
      format: body.format,
      statut: body.statut ?? "brouillon",
      legende: body.legende ?? "",
      hashtags: body.hashtags ?? [],
      musique: body.musique ?? null,
      photos: body.photos ?? [],
      scheduled_for: body.scheduledFor ?? null,
    })
    .select("*")
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? "Échec de la création." }, { status: 500 });
  return NextResponse.json({ publication: versPublication(data) });
}

export async function PATCH(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));
  const id = body.id as string | undefined;
  if (!id) return NextResponse.json({ error: "id requis." }, { status: 400 });

  const champs: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const cle of ["plateforme", "format", "statut", "legende", "hashtags", "musique", "photos"] as const) {
    if (cle in body) champs[cle] = body[cle];
  }
  if ("scheduledFor" in body) champs.scheduled_for = body.scheduledFor;

  const { data, error } = await supabaseAdmin
    .from("publications")
    .update(champs)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? "Publication introuvable." }, { status: 404 });
  return NextResponse.json({ publication: versPublication(data) });
}

export async function DELETE(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requis." }, { status: 400 });

  await supabaseAdmin.from("publications").delete().eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
