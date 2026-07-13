import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";
import {
  obtenirCompteInstagramConnecte,
  publierSurInstagram,
  MetaNonConnecteError,
  MetaRevoqueError,
  InstagramNonLieError,
  InstagramPermissionManquanteError,
  InstagramConteneurEchecError,
} from "@/lib/meta";
import { resoudrePhotoUrl } from "@/lib/photos-server";

// Publie réellement une publication déjà générée dans Studio IA sur le
// compte Instagram Business connecté. `publicationId` doit désigner une
// publication existante appartenant à l'utilisateur — jamais de contenu
// passé librement par le client.
export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));
  const publicationId = typeof body.publicationId === "string" ? body.publicationId : "";
  if (!publicationId) return NextResponse.json({ error: "publicationId requis." }, { status: 400 });

  const { data: publication } = await supabaseAdmin
    .from("publications")
    .select("legende, hashtags, photos, plateforme")
    .eq("id", publicationId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!publication) return NextResponse.json({ error: "Publication introuvable." }, { status: 404 });
  if (publication.plateforme !== "Instagram") {
    return NextResponse.json({ error: "Cette publication n'est pas destinée à Instagram." }, { status: 400 });
  }

  const hashtags = (publication.hashtags ?? []).join(" ");
  const message = [publication.legende, hashtags].filter(Boolean).join("\n\n");
  const premierePhotoId = (publication.photos ?? [])[0];
  const photoUrl = premierePhotoId ? await resoudrePhotoUrl(premierePhotoId, user.id) : undefined;

  if (!photoUrl) {
    return NextResponse.json({ error: "Une photo est requise pour publier sur Instagram." }, { status: 400 });
  }

  try {
    const { igUserId, pageAccessToken } = await obtenirCompteInstagramConnecte(user.id);
    const { id } = await publierSurInstagram({ userId: user.id, igUserId, pageAccessToken, message, photoUrl });
    return NextResponse.json({ ok: true, postId: id });
  } catch (erreur) {
    if (erreur instanceof MetaNonConnecteError) {
      return NextResponse.json({ error: erreur.message, code: "not_connected" }, { status: 409 });
    }
    if (erreur instanceof InstagramNonLieError) {
      return NextResponse.json({ error: erreur.message, code: "not_linked" }, { status: 409 });
    }
    if (erreur instanceof InstagramPermissionManquanteError) {
      return NextResponse.json({ error: erreur.message, code: "permission_missing" }, { status: 409 });
    }
    if (erreur instanceof MetaRevoqueError) {
      return NextResponse.json({ error: erreur.message, code: "revoked" }, { status: 409 });
    }
    if (erreur instanceof InstagramConteneurEchecError) {
      return NextResponse.json({ error: erreur.message, code: "container_failed" }, { status: 502 });
    }
    console.error("Échec de la publication Instagram :", erreur);
    return NextResponse.json({ error: "La publication a échoué. Réessayez dans un instant." }, { status: 502 });
  }
}
