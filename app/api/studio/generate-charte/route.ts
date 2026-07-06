import { NextResponse } from "next/server";
import { isAnthropicConfigured, genererCharteViaAnthropic } from "@/lib/anthropic";
import { genererCharteSimulee, type ReponsesIdentite } from "@/lib/identity";
import type { PilierHistoire } from "@/lib/mock-data";

function dateDuJour() {
  return new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function versPiliersHorodates(piliers: string[]): PilierHistoire[] {
  const date = dateDuJour();
  return piliers.map((texte, index) => ({
    id: `pilier-test-${Date.now()}-${index}`,
    texte,
    origine: "test" as const,
    date,
  }));
}

function delai(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  let reponses: ReponsesIdentite;
  try {
    const body = await request.json();
    reponses = body.reponses ?? {};
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  if (isAnthropicConfigured()) {
    try {
      const brute = await genererCharteViaAnthropic(reponses);
      return NextResponse.json({
        mode: "reel",
        charte: { ...brute, piliers: versPiliersHorodates(brute.piliers) },
      });
    } catch (erreur) {
      console.error("Échec de la génération de charte via Anthropic :", erreur);
      return NextResponse.json(
        { error: "L'analyse par l'IA a échoué. Réessayez dans un instant." },
        { status: 502 }
      );
    }
  }

  // Mode simulation : ANTHROPIC_API_KEY absente. Délai réaliste pour ne
  // pas trahir l'absence d'un vrai appel réseau.
  try {
    await delai(1500 + Math.random() * 1000);
    const brute = genererCharteSimulee(reponses);
    return NextResponse.json({
      mode: "simulation",
      charte: { ...brute, piliers: versPiliersHorodates(brute.piliers) },
    });
  } catch (erreur) {
    console.error("Échec de la simulation de charte :", erreur);
    return NextResponse.json({ error: "La génération a échoué. Réessayez." }, { status: 500 });
  }
}
