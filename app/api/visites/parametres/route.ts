import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { data } = await supabaseAdmin.from("cave_parametres").select("slug_public").eq("user_id", user.id).maybeSingle();
  return NextResponse.json({ slugPublic: data?.slug_public ?? null });
}

export async function PUT(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));
  const slug = typeof body.slugPublic === "string"
    ? body.slugPublic
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    : "";

  if (!slug || slug.length < 3) {
    return NextResponse.json({ error: "Lien invalide (3 caractères minimum, lettres/chiffres/tirets)." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("cave_parametres").upsert({ user_id: user.id, slug_public: slug, updated_at: new Date().toISOString() });
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Ce lien est déjà pris, choisissez-en un autre." }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, slugPublic: slug });
}
