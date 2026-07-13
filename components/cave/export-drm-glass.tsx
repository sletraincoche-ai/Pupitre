"use client";

import { useEffect, useState } from "react";
import { FileDown, CheckCircle2 } from "lucide-react";
import { caveApi } from "@/lib/cave-api";

function moisPrecedentAAAA_MM(): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function derniersMois(n: number): string[] {
  const mois: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < n; i++) {
    mois.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    d.setMonth(d.getMonth() - 1);
  }
  return mois;
}

function libellePeriode(periode: string): string {
  const [annee, mois] = periode.split("-").map(Number);
  const label = new Date(annee, mois - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function telechargerFichier(contenu: string, nom: string) {
  const blob = new Blob([contenu], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nom;
  a.click();
  URL.revokeObjectURL(url);
}

type StatutDeclaration = "brouillon" | "genere" | "depose";
type Declaration = { periode: string; statut: StatutDeclaration | null; genere_le: string | null; depose_le: string | null };

export function ExportDrmGlass({ numeroAgrement }: { numeroAgrement: string | null }) {
  const [periode, setPeriode] = useState(moisPrecedentAAAA_MM());
  const [declarations, setDeclarations] = useState<Record<string, Declaration>>({});
  const [xml, setXml] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function rafraichirDeclarations() {
    const { declarations: liste } = await caveApi.listerDeclarations();
    const parPeriode: Record<string, Declaration> = {};
    for (const d of liste) parPeriode[d.periode] = { periode: d.periode, statut: d.statut as StatutDeclaration, genere_le: d.genere_le, depose_le: d.depose_le };
    setDeclarations(parPeriode);
  }

  useEffect(() => {
    rafraichirDeclarations();
  }, []);

  // Recharge le XML déjà généré pour la période sélectionnée (s'il
  // existe) sans avoir à regénérer — permet de retélécharger une
  // déclaration passée sans repasser par le calcul.
  useEffect(() => {
    setXml(null);
    setErreur(null);
    if (declarations[periode]) {
      caveApi.telechargerDrm(periode).then((r) => setXml(r.xml)).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periode, declarations]);

  async function generer() {
    setErreur(null);
    setEnCours(true);
    try {
      const { xml: xmlGenere } = await caveApi.genererDrm(periode);
      setXml(xmlGenere);
      await rafraichirDeclarations();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de la génération.");
    } finally {
      setEnCours(false);
    }
  }

  async function marquerDepose() {
    await caveApi.marquerDepose(periode);
    await rafraichirDeclarations();
  }

  const statutActuel = declarations[periode]?.statut ?? null;

  return (
    <div className="flex flex-col gap-3">
      {!numeroAgrement && (
        <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
          Numéro d&apos;agrément non renseigné — à saisir dans Paramètres avant de générer un export.
        </p>
      )}

      {/* Statut par période — la déclaration de dépôt reste déclarative :
          Pupitre ne dépose jamais sur CIEL à la place de l'utilisateur,
          il ne fait que refléter ce que celui-ci confirme lui-même. */}
      <div className="flex flex-wrap gap-1.5">
        {derniersMois(6).map((m) => {
          const d = declarations[m];
          const label = libellePeriode(m);
          const selectionne = m === periode;
          let badge = "Non générée";
          let classes = "border-white/15 bg-white/5 text-white/60";
          if (d?.statut === "genere") {
            badge = `Générée le ${formatDate(d.genere_le)}`;
            classes = "border-gold/30 bg-gold/10 text-gold";
          } else if (d?.statut === "depose") {
            badge = `Déposée le ${formatDate(d.depose_le)}`;
            classes = "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
          }
          return (
            <button
              key={m}
              onClick={() => setPeriode(m)}
              className={`rounded-xl border px-3 py-1.5 text-left text-xs transition-colors ${classes} ${selectionne ? "ring-1 ring-white/40" : ""}`}
            >
              <p className="font-medium">{label}</p>
              <p className="opacity-80">{badge}</p>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="month"
          value={periode}
          onChange={(e) => setPeriode(e.target.value)}
          className="h-10 rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
        />
        <button
          onClick={generer}
          disabled={enCours || !numeroAgrement || statutActuel === "depose"}
          className="flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50"
        >
          <FileDown className="size-4" />
          {enCours ? "Génération…" : statutActuel ? "Régénérer l'export DTI+" : "Générer l'export DTI+"}
        </button>
      </div>

      {erreur && <p className="text-xs text-red-300">{erreur}</p>}

      {xml && (
        <div className="rounded-xl border border-white/15 bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white">Export pour {libellePeriode(periode)}</p>
            {statutActuel && <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/70">{statutActuel}</span>}
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => telechargerFichier(xml, `DRM-${periode}.xml`)}
              className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
            >
              Télécharger le XML
            </button>
            {statutActuel === "genere" && (
              <button
                onClick={marquerDepose}
                className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-200 hover:bg-emerald-400/20"
              >
                <CheckCircle2 className="size-3.5" />
                Marquer comme déposé sur CIEL
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
