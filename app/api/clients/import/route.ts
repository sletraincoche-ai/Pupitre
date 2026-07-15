import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

type LigneEntree = { nom?: unknown; email?: unknown; telephone?: unknown; pays?: unknown };

// Le parsing CSV et la correspondance de colonnes restent côté client
// (aperçu immédiat, pas d'aller-retour serveur par ligne) — cette route
// reçoit des lignes déjà structurées et ne fait que la partie qui doit
// être fiable : dédoublonnage contre les VRAIES données existantes
// (jamais une liste en mémoire côté client, potentiellement périmée) et
// l'insertion elle-même. Dédoublonnage par email si présent, sinon par
// (nom + téléphone) — exigence explicite du brief.
export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));
  const lignes: LigneEntree[] = Array.isArray(body.lignes) ? body.lignes : [];
  if (lignes.length === 0) return NextResponse.json({ error: "Aucune ligne à importer." }, { status: 400 });

  const { data: existants } = await supabaseAdmin.from("clients").select("nom, email, telephone").eq("user_id", user.id);
  const emailsExistants = new Set((existants ?? []).filter((c) => c.email).map((c) => c.email!.toLowerCase()));
  const nomTelExistants = new Set((existants ?? []).filter((c) => c.nom && c.telephone).map((c) => `${c.nom.toLowerCase()}|${c.telephone}`));

  let importes = 0;
  let doublons = 0;
  let incomplets = 0;
  const aInserer: Record<string, unknown>[] = [];

  for (const brut of lignes) {
    const nom = typeof brut.nom === "string" ? brut.nom.trim() : "";
    const email = typeof brut.email === "string" ? brut.email.trim() : "";
    const telephone = typeof brut.telephone === "string" ? brut.telephone.trim() : "";
    const pays = typeof brut.pays === "string" ? brut.pays.trim() : "";

    if (!nom || (!email && !telephone)) {
      incomplets++;
      continue;
    }

    const cleEmail = email ? email.toLowerCase() : null;
    const cleNomTel = telephone ? `${nom.toLowerCase()}|${telephone}` : null;
    const estDoublon = (cleEmail && emailsExistants.has(cleEmail)) || (cleNomTel && nomTelExistants.has(cleNomTel));
    if (estDoublon) {
      doublons++;
      continue;
    }

    // Empêche aussi les doublons internes au fichier importé lui-même.
    if (cleEmail) emailsExistants.add(cleEmail);
    if (cleNomTel) nomTelExistants.add(cleNomTel);

    aInserer.push({
      user_id: user.id,
      nom,
      email: email || null,
      telephone: telephone || null,
      pays: pays || "FR",
      profil: "particulier",
      origine: "Import CSV",
    });
    importes++;
  }

  if (aInserer.length > 0) {
    const { error } = await supabaseAdmin.from("clients").insert(aInserer);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ importes, doublons, incomplets });
}
