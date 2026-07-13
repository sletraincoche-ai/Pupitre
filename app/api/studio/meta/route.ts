import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { data } = await supabaseAdmin
    .from("meta_connections")
    .select("page_id, page_name, connected_at, instagram_business_id, instagram_username, instagram_publish_autorise")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return NextResponse.json({ connecte: false, instagram: { connecte: false } });

  // Un compte Facebook peut être lié (data existe) sans qu'une Page ait
  // encore été choisie (compte gérant plusieurs Pages) — le client
  // affiche alors le sélecteur plutôt que le badge "connecté".
  //
  // Instagram est un état à part : un compte Business peut être lié à la
  // Page (instagram_business_id) sans que la permission de publication
  // ait été accordée sur le token actuel (instagram_publish_autorise) —
  // ce dernier cas nécessite une reconnexion dédiée côté client.
  return NextResponse.json({
    connecte: true,
    choixPageRequis: !data.page_id,
    pageName: data.page_name ?? null,
    connecteLe: data.connected_at,
    instagram: {
      connecte: !!data.instagram_business_id && data.instagram_publish_autorise,
      lie: !!data.instagram_business_id,
      permissionManquante: !!data.instagram_business_id && !data.instagram_publish_autorise,
      username: data.instagram_username ?? null,
    },
  });
}

export async function DELETE() {
  const { user, response } = await requireUser();
  if (!user) return response;

  await supabaseAdmin.from("meta_connections").delete().eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
