import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { verifierChaineCaisse } from "@/lib/caisse";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const resultat = await verifierChaineCaisse(user.id);
  return NextResponse.json(resultat);
}
