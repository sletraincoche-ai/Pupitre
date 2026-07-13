import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";

const BUCKET = "studio-photos";
const SIGNED_URL_TTL = 60 * 5; // 5 min — juste le temps qu'un service externe (Facebook, Instagram) la récupère.

// publications.photos stocke des identifiants de la table `photos` (voir
// PhotoPicker), pas des URLs — à résoudre en URL signée publique avant tout
// appel à une API externe, comme le fait déjà GET /api/studio/photos pour
// l'aperçu côté client.
export async function resoudrePhotoUrl(photoId: string, userId: string): Promise<string | undefined> {
  const { data: photo } = await supabaseAdmin
    .from("photos")
    .select("storage_path")
    .eq("id", photoId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!photo) return undefined;

  const { data: signee } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(photo.storage_path, SIGNED_URL_TTL);
  return signee?.signedUrl;
}
