import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { data, error } = await supabaseAdmin
    .from("cave_drm_declarations")
    .select("periode, statut, genere_le, depose_le")
    .eq("user_id", user.id)
    .order("periode", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ declarations: data ?? [] });
}
