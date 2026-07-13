import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";
import { genererFec } from "@/lib/facturation-fec";

// Export comptable période donnée — format FEC (art. A47 A-1 LPF),
// directement importable dans Sage/EBP/Cegid/Isacompta. mois="AAAA-MM"
// exporte ce mois calendaire ; a defaut, "debut"/"fin" (AAAA-MM-JJ,
// fin exclue) permettent une période arbitraire.
export async function GET(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const { data: parametres } = await supabaseAdmin.from("cave_parametres").select("siret").eq("user_id", user.id).maybeSingle();
  if (!parametres?.siret) {
    return NextResponse.json({ error: "SIRET non renseigné dans les paramètres de facturation — requis pour nommer le fichier FEC (SirenFECaaaammjj.txt)." }, { status: 400 });
  }
  const siren = parametres.siret.replace(/\s/g, "").slice(0, 9);

  const mois = request.nextUrl.searchParams.get("mois");
  let debut: string;
  let finExclue: string;
  if (mois && /^\d{4}-\d{2}$/.test(mois)) {
    const [annee, m] = mois.split("-").map(Number);
    debut = `${mois}-01`;
    finExclue = new Date(Date.UTC(annee, m, 1)).toISOString().slice(0, 10);
  } else {
    const debutParam = request.nextUrl.searchParams.get("debut");
    const finParam = request.nextUrl.searchParams.get("fin");
    if (!debutParam || !finParam) return NextResponse.json({ error: "Fournir mois=AAAA-MM ou debut/fin=AAAA-MM-JJ." }, { status: 400 });
    debut = debutParam;
    finExclue = finParam;
  }

  const { contenu, nomFichier } = await genererFec(user.id, siren, debut, finExclue);
  return NextResponse.json({ contenu, nomFichier });
}
