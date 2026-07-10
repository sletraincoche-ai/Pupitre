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

  if (data) {
    return NextResponse.json({
      tunnelTermine: data.tunnel_termine,
      etapeTunnel: data.etape_tunnel,
      premierAcces: false,
    });
  }

  // Aucun rang : tout premier accès à Studio IA pour ce compte. On marque
  // *tout de suite*, côté serveur, tunnel_termine=true en base — pas
  // après coup via un futur PUT côté client, qui pourrait être perdu
  // (navigation immédiate, onglet fermé) et rouvrir le tunnel à la
  // prochaine visite. `tunnelTermine` renvoyé reste donc vrai (fidèle à
  // la base) ; c'est `premierAcces`, un simple signal ponctuel non
  // persisté, qui dit au client d'afficher le tunnel cette unique fois —
  // sans jamais faire mentir l'état que le client pourrait réécrire.
  const { error: erreurInsertion } = await supabaseAdmin
    .from("onboarding_state")
    .insert({ user_id: user.id, tunnel_termine: true, etape_tunnel: 0 });

  if (!erreurInsertion) {
    return NextResponse.json({ tunnelTermine: true, etapeTunnel: 0, premierAcces: true });
  }

  // L'insertion a échoué (rang déjà créé entre-temps par une requête
  // concurrente, ex. React Strict Mode ou double onglet) — on relit
  // l'état réel plutôt que de supposer.
  const { data: relu } = await supabaseAdmin
    .from("onboarding_state")
    .select("tunnel_termine, etape_tunnel")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({
    tunnelTermine: relu?.tunnel_termine ?? true,
    etapeTunnel: relu?.etape_tunnel ?? 0,
    premierAcces: false,
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
