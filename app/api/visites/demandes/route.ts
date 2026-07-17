import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { listerDemandesEnAttente, verifierEtRelancerDemandes } from "@/lib/visites-server";

// Point de passage naturel pour la relance à 24h (pas de cron dans ce
// projet — même principe que signalerClientInactifSiNouveau du chantier
// Clients) : chaque consultation de l'onglet Demandes en ligne vérifie
// et relance les demandes en attente depuis plus de 24h.
export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  await verifierEtRelancerDemandes(user.id);
  const demandes = await listerDemandesEnAttente(user.id);
  return NextResponse.json({ demandes });
}
