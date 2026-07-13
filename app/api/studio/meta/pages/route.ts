import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";
import { listerPagesFacebookAvecRepli, recupererCompteInstagramLie } from "@/lib/meta";

// Liste les Pages Facebook administrées par le compte connecté, pour le
// sélecteur affiché quand plusieurs Pages sont disponibles. Ne renvoie
// jamais les access_token de Page au client — seulement id/name.
export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { data } = await supabaseAdmin
    .from("meta_connections")
    .select("user_access_token")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return NextResponse.json({ error: "Aucun compte Facebook connecté." }, { status: 409 });

  try {
    const pages = await listerPagesFacebookAvecRepli(data.user_access_token);
    return NextResponse.json({ pages: pages.map((p) => ({ id: p.id, name: p.name })) });
  } catch (erreur) {
    console.error("Échec de la liste des Pages Facebook :", erreur);
    return NextResponse.json({ error: "Impossible de récupérer les Pages Facebook." }, { status: 502 });
  }
}

// Enregistre la Page choisie par l'utilisateur — son access_token propre
// (retrouvé via un nouvel appel à /me/accounts, jamais transmis par le
// client) devient le jeton utilisé pour publier.
export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));
  const pageId = typeof body.pageId === "string" ? body.pageId : "";
  if (!pageId) return NextResponse.json({ error: "pageId requis." }, { status: 400 });

  const { data } = await supabaseAdmin
    .from("meta_connections")
    .select("user_access_token")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) return NextResponse.json({ error: "Aucun compte Facebook connecté." }, { status: 409 });

  try {
    const pages = await listerPagesFacebookAvecRepli(data.user_access_token);
    const page = pages.find((p) => p.id === pageId);
    if (!page) return NextResponse.json({ error: "Page introuvable." }, { status: 404 });

    const instagram = await recupererCompteInstagramLie(page.id, page.access_token).catch((e) => {
      console.error("Échec de la résolution du compte Instagram lié à la Page :", e);
      return null;
    });

    const { error } = await supabaseAdmin
      .from("meta_connections")
      .update({
        page_id: page.id,
        page_name: page.name,
        page_access_token: page.access_token,
        instagram_business_id: instagram?.id ?? null,
        instagram_username: instagram?.username ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true, pageName: page.name });
  } catch (erreur) {
    console.error("Échec de la sélection de Page Facebook :", erreur);
    return NextResponse.json({ error: "Impossible d'enregistrer la Page choisie." }, { status: 502 });
  }
}
