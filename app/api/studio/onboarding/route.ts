import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { data } = await supabaseAdmin
    .from("onboarding_state")
    .select("tunnel_termine, etape_tunnel")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({
    tunnelTermine: data?.tunnel_termine ?? false,
    etapeTunnel: data?.etape_tunnel ?? 0,
  });
}

export async function PUT(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));
  const { error } = await supabaseAdmin.from("onboarding_state").upsert({
    user_id: user.id,
    tunnel_termine: !!body.tunnelTermine,
    etape_tunnel: Number.isFinite(body.etapeTunnel) ? body.etapeTunnel : 0,
    updated_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
