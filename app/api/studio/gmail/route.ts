import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { data } = await supabaseAdmin
    .from("gmail_connections")
    .select("google_email, connected_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return NextResponse.json({ connecte: false });

  return NextResponse.json({ connecte: true, email: data.google_email, connecteLe: data.connected_at });
}

export async function DELETE() {
  const { user, response } = await requireUser();
  if (!user) return response;

  await supabaseAdmin.from("gmail_connections").delete().eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
