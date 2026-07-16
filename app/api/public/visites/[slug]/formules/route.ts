import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { resoudreUserIdParSlug } from "@/lib/visites-server";

// Public, sans authentification — réservation en ligne accessible sans
// compte (exigence explicite du brief). Ne renvoie que les champs
// nécessaires à l'affichage, jamais user_id ni de données internes.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const userId = await resoudreUserIdParSlug(slug);
  if (!userId) return NextResponse.json({ error: "Page de réservation introuvable." }, { status: 404 });

  const { data, error } = await supabaseAdmin
    .from("visites_formules")
    .select("id, nom, description, duree_minutes, mode_tarification, prix_par_personne, prix_total, capacite_max")
    .eq("user_id", userId)
    .eq("archive", false)
    .order("prix_par_personne", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: parametres } = await supabaseAdmin.from("cave_parametres").select("raison_sociale").eq("user_id", userId).maybeSingle();

  return NextResponse.json({ formules: data ?? [], nomDomaine: parametres?.raison_sociale ?? null });
}
