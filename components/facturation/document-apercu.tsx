"use client";

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { GlassModal } from "@/components/glass/glass-modal";
import { facturationApi, type DocumentFacturation, type LigneFacturation, type ParametresLegaux, type TypeDocumentFacturation } from "@/lib/facturation-api";

const LABELS_TYPE: Record<TypeDocumentFacturation, string> = { devis: "Devis", bon_livraison: "Bon de livraison", facture: "Facture", avoir: "Avoir" };

function formatMontant(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

// Aperçu imprimable — pas de génération PDF côté serveur en V1 (le
// format Factur-X complet est explicitement hors périmètre de ce
// chantier, voir mémoire projet), l'impression navigateur (Cmd/Ctrl+P →
// "Enregistrer en PDF") est le chemin pragmatique retenu. Le contenu
// imprimé est isolé du reste de l'app via #facture-imprimable, seul
// élément rendu visible par la feuille de style @media print ci-dessous.
export function DocumentApercu({ documentId, parametres, onClose }: { documentId: string; parametres: ParametresLegaux | null; onClose: () => void }) {
  const [document, setDocument] = useState<DocumentFacturation | null>(null);
  const [lignes, setLignes] = useState<LigneFacturation[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    setChargement(true);
    facturationApi
      .obtenirDocument(documentId)
      .then((r) => {
        setDocument(r.document);
        setLignes(r.lignes);
      })
      .finally(() => setChargement(false));
  }, [documentId]);

  return (
    <GlassModal open={!!documentId} onClose={onClose} title={document ? `${LABELS_TYPE[document.type]} ${document.numero ?? "(brouillon)"}` : "Chargement…"} maxWidthClassName="max-w-3xl">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #facture-imprimable, #facture-imprimable * { visibility: visible; }
          #facture-imprimable { position: absolute; top: 0; left: 0; width: 100%; padding: 24px; }
        }
      `}</style>

      {chargement || !document ? (
        <p className="text-sm text-white/60">Chargement…</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15"
            >
              <Printer className="size-3.5" />
              Imprimer / Enregistrer en PDF
            </button>
          </div>

          <div id="facture-imprimable" className="rounded-2xl border border-white/10 bg-black/40 p-6 text-white">
            <div className="flex justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">{parametres?.raison_sociale ?? "Raison sociale non configurée"}</p>
                {parametres?.forme_juridique && <p className="text-xs text-white/60">{parametres.forme_juridique}{parametres.capital_social ? ` au capital de ${formatMontant(parametres.capital_social)}` : ""}</p>}
                {parametres?.adresse && <p className="text-xs text-white/60">{parametres.adresse}, {parametres.code_postal} {parametres.ville}</p>}
                {parametres?.siret && <p className="text-xs text-white/60">SIRET {parametres.siret}</p>}
                {parametres?.tva_intracommunautaire && <p className="text-xs text-white/60">TVA {parametres.tva_intracommunautaire}</p>}
                {parametres?.rcs_ville && <p className="text-xs text-white/60">{parametres.rcs_ville}</p>}
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">{LABELS_TYPE[document.type]}</p>
                <p className="text-sm text-white/80">{document.numero ?? "Brouillon — non numéroté"}</p>
                <p className="mt-2 text-xs text-white/60">Émis le {formatDate(document.date_emission)}</p>
                {document.date_echeance && <p className="text-xs text-white/60">Échéance : {formatDate(document.date_echeance)}</p>}
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-white/50">Destinataire</p>
              <p className="mt-1 text-sm">{document.client_nom_snapshot ?? "Vente directe"}</p>
              {document.client_adresse_snapshot && <p className="text-xs text-white/60">{document.client_adresse_snapshot}</p>}
              {document.client_siret_snapshot && <p className="text-xs text-white/60">SIRET {document.client_siret_snapshot}</p>}
              {document.client_tva_snapshot && <p className="text-xs text-white/60">TVA {document.client_tva_snapshot}</p>}
            </div>

            <table className="mt-6 w-full text-sm">
              <thead>
                <tr className="border-b border-white/15 text-left text-xs text-white/50">
                  <th className="py-2 font-normal">Désignation</th>
                  <th className="py-2 text-right font-normal">Qté</th>
                  <th className="py-2 text-right font-normal">PU HT</th>
                  <th className="py-2 text-right font-normal">TVA</th>
                  <th className="py-2 text-right font-normal">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((l) => (
                  <tr key={l.id} className="border-b border-white/5">
                    <td className="py-2">{l.designation}</td>
                    <td className="py-2 text-right tabular-nums">{l.quantite}</td>
                    <td className="py-2 text-right tabular-nums">{formatMontant(l.prix_unitaire_ht)}</td>
                    <td className="py-2 text-right tabular-nums">{l.taux_tva}%</td>
                    <td className="py-2 text-right tabular-nums">{formatMontant(l.montant_ht)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex justify-end">
              <div className="w-56 text-sm">
                <div className="flex justify-between py-1 text-white/70">
                  <span>Total HT</span>
                  <span className="tabular-nums">{formatMontant(document.total_ht)}</span>
                </div>
                <div className="flex justify-between py-1 text-white/70">
                  <span>TVA</span>
                  <span className="tabular-nums">{formatMontant(document.total_tva)}</span>
                </div>
                <div className="flex justify-between border-t border-white/15 py-1.5 font-semibold">
                  <span>Total TTC</span>
                  <span className="tabular-nums">{formatMontant(document.total_ttc)}</span>
                </div>
              </div>
            </div>

            {document.type === "facture" && (
              <div className="mt-6 border-t border-white/10 pt-4 text-xs text-white/50">
                {parametres?.iban && <p>Règlement par virement — IBAN {parametres.iban}{parametres.bic ? ` — BIC ${parametres.bic}` : ""}</p>}
                <p className="mt-1">{parametres?.mention_penalites_retard}</p>
              </div>
            )}

            {document.observations && <p className="mt-4 text-xs text-white/60">{document.observations}</p>}
          </div>
        </div>
      )}
    </GlassModal>
  );
}
