import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { data } = await supabaseAdmin
    .from("identity_state")
    .select("consentement, etape_courante, reponses, charte_proposee, charte")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({
    consentement: data?.consentement ?? false,
    etapeCourante: data?.etape_courante ?? 0,
    reponses: data?.reponses ?? {},
    charteProposee: data?.charte_proposee ?? null,
    charte: data?.charte ?? null,
  });
}

export async function PUT(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));
  const { error } = await supabaseAdmin.from("identity_state").upsert({
    user_id: user.id,
    consentement: !!body.consentement,
    etape_courante: Number.isFinite(body.etapeCourante) ? body.etapeCourante : 0,
    reponses: body.reponses ?? {},
    charte_proposee: body.charteProposee ?? null,
    charte: body.charte ?? null,
    updated_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
