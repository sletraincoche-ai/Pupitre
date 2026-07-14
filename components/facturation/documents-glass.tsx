"use client";

import { useState } from "react";
import { FileText, Send, ArrowRightLeft, Trash2, Eye } from "lucide-react";
import { facturationApi, type DocumentFacturation, type TypeDocumentFacturation } from "@/lib/facturation-api";
import { GlassEmptyState } from "@/components/glass/glass-empty-state";

const LABELS_TYPE: Record<TypeDocumentFacturation, string> = { devis: "Devis", bon_livraison: "Bon de livraison", facture: "Facture", avoir: "Avoir" };

function BadgeStatut({ document }: { document: DocumentFacturation }) {
  if (document.statut === "brouillon") return <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">Brouillon</span>;
  if (document.statut === "annule") return <span className="rounded-full border border-red-400/30 px-2 py-0.5 text-xs text-red-300">Annulé</span>;
  return <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-200">Émis — {document.numero}</span>;
}

export function DocumentsGlass({ documents, onChange, onApercu }: { documents: DocumentFacturation[]; onChange: () => void; onApercu: (id: string) => void }) {
  const [enCours, setEnCours] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  async function emettre(id: string) {
    setEnCours(id);
    setErreur(null);
    try {
      await facturationApi.emettreDocument(id);
      onChange();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de l'émission.");
    } finally {
      setEnCours(null);
    }
  }

  async function transformer(id: string, versType: TypeDocumentFacturation) {
    setEnCours(id);
    setErreur(null);
    try {
      await facturationApi.transformerDocument(id, versType);
      onChange();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de la transformation.");
    } finally {
      setEnCours(null);
    }
  }

  async function supprimer(id: string) {
    setEnCours(id);
    try {
      await facturationApi.supprimerDocument(id);
      onChange();
    } finally {
      setEnCours(null);
    }
  }

  if (documents.length === 0) {
    return <GlassEmptyState icon={FileText} title="Aucun document" description="Créez un devis, un bon de livraison ou une facture pour commencer." />;
  }

  return (
    <div className="flex flex-col gap-1">
      {erreur && <p className="mb-1 text-xs text-red-300">{erreur}</p>}
      {documents.map((d) => (
        <div key={d.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5">
          <button onClick={() => onApercu(d.id)} className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm text-white hover:underline">
              {LABELS_TYPE[d.type]} {d.numero ? `— ${d.numero}` : ""} {d.client_nom_snapshot ? `— ${d.client_nom_snapshot}` : ""}
            </p>
            <p className="truncate text-xs text-white/55">
              {d.total_ttc.toFixed(2)} € TTC — {new Date(d.created_at).toLocaleDateString("fr-FR")}
            </p>
          </button>
          <button onClick={() => onApercu(d.id)} aria-label="Aperçu" className="flex size-7 shrink-0 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white">
            <Eye className="size-3.5" />
          </button>
          <BadgeStatut document={d} />
          {d.statut === "brouillon" && (
            <>
              <button
                onClick={() => emettre(d.id)}
                disabled={enCours === d.id}
                className="flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-xs text-gold hover:bg-gold/20 disabled:opacity-50"
              >
                <Send className="size-3" />
                Émettre
              </button>
              <button onClick={() => supprimer(d.id)} disabled={enCours === d.id} className="flex size-7 shrink-0 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-red-300">
                <Trash2 className="size-3.5" />
              </button>
            </>
          )}
          {d.statut === "emis" && d.type === "devis" && (
            <button
              onClick={() => transformer(d.id, "facture")}
              disabled={enCours === d.id}
              className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs text-white/80 hover:bg-white/15 disabled:opacity-50"
            >
              <ArrowRightLeft className="size-3" />
              → Facture
            </button>
          )}
          {d.statut === "emis" && d.type === "bon_livraison" && (
            <button
              onClick={() => transformer(d.id, "facture")}
              disabled={enCours === d.id}
              className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs text-white/80 hover:bg-white/15 disabled:opacity-50"
            >
              <ArrowRightLeft className="size-3" />
              → Facture
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
