import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";
import { calculerStatsClient, calculerSegments, signalerClientInactifSiNouveau } from "@/lib/clients-server";

// Liste avec stats/segments calculés en une seule requête groupée sur
// cave_mouvements (pas une requête par client) — même registre que la
// fiche détaillée, jamais de table d'historique parallèle.
export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { data: clients, error } = await supabaseAdmin.from("clients").select("*").eq("user_id", user.id).order("nom", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: mouvements } = await supabaseAdmin
    .from("cave_mouvements")
    .select("client_id, montant, quantite_bouteilles, horodatage")
    .eq("user_id", user.id)
    .eq("annule", false)
    .in("type", ["vente_client", "export"])
    .not("client_id", "is", null)
    .order("horodatage", { ascending: false });

  const parClient = new Map<string, { montant: number | null; quantite_bouteilles: number; horodatage: string }[]>();
  for (const m of mouvements ?? []) {
    if (!m.client_id) continue;
    const liste = parClient.get(m.client_id) ?? [];
    liste.push(m);
    parClient.set(m.client_id, liste);
  }

  const resultats = (clients ?? []).map((c) => {
    const stats = calculerStatsClient(parClient.get(c.id) ?? []);
    const segments = calculerSegments(stats.dernierAchat, stats.montantTotal);
    return { ...c, stats, segments };
  });

  // Effet de bord volontaire : ce point de passage (la liste, consultée
  // régulièrement) sert de déclencheur naturel pour l'événement Agenda
  // "client inactif" en l'absence de cron dans ce projet — voir
  // lib/clients-server.ts pour la garde anti-doublon.
  for (const r of resultats) {
    if (r.segments.some((s: string) => s.startsWith("Inactif"))) {
      signalerClientInactifSiNouveau(user.id, r.id, r.nom, r.segments).catch(() => {});
    }
  }

  return NextResponse.json({ clients: resultats });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));
  const nom = typeof body.nom === "string" ? body.nom.trim() : "";
  const profil = typeof body.profil === "string" ? body.profil : "particulier";

  if (!nom) return NextResponse.json({ error: "Nom requis." }, { status: 400 });
  if (!["particulier", "professionnel", "chr"].includes(profil)) {
    return NextResponse.json({ error: "Profil invalide." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("clients")
    .insert({
      user_id: user.id,
      nom,
      profil,
      email: typeof body.email === "string" ? body.email : null,
      telephone: typeof body.telephone === "string" ? body.telephone : null,
      adresse: typeof body.adresse === "string" ? body.adresse : null,
      code_postal: typeof body.codePostal === "string" ? body.codePostal : null,
      ville: typeof body.ville === "string" ? body.ville : null,
      pays: typeof body.pays === "string" ? body.pays : "FR",
      siret: typeof body.siret === "string" ? body.siret : null,
      tva_intracommunautaire: typeof body.tvaIntracommunautaire === "string" ? body.tvaIntracommunautaire : null,
      origine: typeof body.origine === "string" ? body.origine : null,
      notes: typeof body.notes === "string" ? body.notes : null,
      tags: Array.isArray(body.tags) ? body.tags : [],
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ client: data }, { status: 201 });
}
