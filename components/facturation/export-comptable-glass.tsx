"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { facturationApi } from "@/lib/facturation-api";

function moisCourant(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function telechargerFichier(contenu: string, nom: string) {
  const blob = new Blob([contenu], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nom;
  a.click();
  URL.revokeObjectURL(url);
}

// Export FEC — format officiel (art. A47 A-1 LPF), importable tel quel
// dans Sage/EBP/Cegid/Isacompta.
export function ExportComptableGlass() {
  const [mois, setMois] = useState(moisCourant());
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [dernierExport, setDernierExport] = useState<string | null>(null);

  async function exporter() {
    setEnCours(true);
    setErreur(null);
    try {
      const { contenu, nomFichier } = await facturationApi.exportComptable(mois);
      telechargerFichier(contenu, nomFichier);
      setDernierExport(nomFichier);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de l'export.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          type="month"
          value={mois}
          onChange={(e) => setMois(e.target.value)}
          className="h-10 rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
        />
        <button onClick={exporter} disabled={enCours} className="flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50">
          <FileDown className="size-4" />
          {enCours ? "Export…" : "Exporter le FEC"}
        </button>
      </div>
      {erreur && <p className="text-xs text-red-300">{erreur}</p>}
      {dernierExport && <p className="text-xs text-white/55">Téléchargé : {dernierExport}</p>}
    </div>
  );
}
