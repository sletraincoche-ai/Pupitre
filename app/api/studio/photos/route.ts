import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

const BUCKET = "studio-photos";
const SIGNED_URL_TTL = 60 * 60; // 1h — régénérée à chaque GET

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { data: photos, error } = await supabaseAdmin
    .from("photos")
    .select("id, storage_path, legende, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const avecUrls = await Promise.all(
    (photos ?? []).map(async (p) => {
      const { data: signee } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(p.storage_path, SIGNED_URL_TTL);
      return { id: p.id, legende: p.legende, url: signee?.signedUrl ?? "" };
    })
  );

  return NextResponse.json({ photos: avecUrls });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const form = await request.formData().catch(() => null);
  const fichier = form?.get("fichier");
  const legende = typeof form?.get("legende") === "string" ? (form!.get("legende") as string) : "";

  if (!(fichier instanceof File) || !fichier.type.startsWith("image/")) {
    return NextResponse.json({ error: "Fichier image requis." }, { status: 400 });
  }

  const extension = fichier.name.split(".").pop() || "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
  const buffer = Buffer.from(await fichier.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: fichier.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: photo, error: insertError } = await supabaseAdmin
    .from("photos")
    .insert({ user_id: user.id, storage_path: path, legende: legende || fichier.name })
    .select("id, legende")
    .single();

  if (insertError || !photo) {
    await supabaseAdmin.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ error: insertError?.message ?? "Échec de l'enregistrement." }, { status: 500 });
  }

  const { data: signee } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
  return NextResponse.json({ photo: { id: photo.id, legende: photo.legende, url: signee?.signedUrl ?? "" } });
}

export async function DELETE(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requis." }, { status: 400 });

  const { data: photo } = await supabaseAdmin
    .from("photos")
    .select("storage_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!photo) return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });

  await supabaseAdmin.storage.from(BUCKET).remove([photo.storage_path]);
  await supabaseAdmin.from("photos").delete().eq("id", id).eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
