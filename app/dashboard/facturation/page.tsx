"use client";

import { useEffect, useState } from "react";
import { Plus, Settings2, UserPlus } from "lucide-react";
import { GlassPageShell } from "@/components/glass/glass-page-shell";
import { GlassPanel } from "@/components/glass/glass-panel";
import { GlassModal } from "@/components/glass/glass-modal";
import { DocumentsGlass } from "@/components/facturation/documents-glass";
import { NouveauDocumentForm } from "@/components/facturation/nouveau-document-form";
import { NouveauClientForm } from "@/components/facturation/nouveau-client-form";
import { ParametresLegauxForm } from "@/components/facturation/parametres-legaux-form";
import { CaisseGlass } from "@/components/facturation/caisse-glass";
import { ExportComptableGlass } from "@/components/facturation/export-comptable-glass";
import { DocumentApercu } from "@/components/facturation/document-apercu";
import { facturationApi, type Client, type DocumentFacturation, type ParametresLegaux } from "@/lib/facturation-api";
import { caveApi, type Produit } from "@/lib/cave-api";

// Reconstruction réelle de Facturation — née attachée au registre de
// Cave (voir mémoire projet_pupitre_facturation) : toute ligne de
// facture/BL avec un produit crée un vrai mouvement de cave via
// creerMouvementCave, la même fonction que la saisie manuelle dans
// Cave. Aucune donnée démo — tout vient de vraies tables, même vides au
// départ.
export default function FacturationPage() {
  const [documents, setDocuments] = useState<DocumentFacturation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [parametres, setParametres] = useState<ParametresLegaux | null>(null);
  const [chargement, setChargement] = useState(true);
  const [modalDocument, setModalDocument] = useState(false);
  const [modalClient, setModalClient] = useState(false);
  const [modalParametres, setModalParametres] = useState(false);
  const [apercuId, setApercuId] = useState<string | null>(null);

  async function rafraichirDocuments() {
    const { documents } = await facturationApi.listerDocuments();
    setDocuments(documents);
  }

  async function rafraichirTout() {
    const [d, c, p, params] = await Promise.all([
      facturationApi.listerDocuments(),
      facturationApi.listerClients(),
      caveApi.listerProduits(),
      facturationApi.parametres(),
    ]);
    setDocuments(d.documents);
    setClients(c.clients);
    setProduits(p.produits);
    setParametres(params.parametres);
  }

  useEffect(() => {
    rafraichirTout().finally(() => setChargement(false));
  }, []);

  if (chargement) return null;

  const siretManquant = !parametres?.siret;

  return (
    <GlassPageShell>
      <div className="flex flex-col gap-4 pb-10">
        <GlassPanel intensity="strong" className="shrink-0 px-4 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-semibold tracking-tight text-white">Facturation</p>
              <p className="truncate text-xs text-white/70">Devis, bons de livraison, factures — nés attachés au registre de Cave.</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => setModalParametres(true)}
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15"
              >
                <Settings2 className="size-3.5" />
                {siretManquant ? "SIRET manquant" : parametres?.raison_sociale || "Identité légale"}
              </button>
              <button
                onClick={() => setModalClient(true)}
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15"
              >
                <UserPlus className="size-3.5" />
                Client
              </button>
              <button onClick={() => setModalDocument(true)} className="flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-xs font-medium text-ink hover:bg-gold/90">
                <Plus className="size-3.5" />
                Nouveau document
              </button>
            </div>
          </div>
        </GlassPanel>

        {siretManquant && (
          <GlassPanel intensity="light" className="border-amber-400/30 bg-amber-400/10 p-3">
            <p className="text-xs text-amber-200">
              Identité légale non configurée — les factures émises n&apos;auront pas les mentions obligatoires (SIRET, TVA). Configurez-la avant tout usage réel.
            </p>
          </GlassPanel>
        )}

        <GlassPanel intensity="regular" className="p-4">
          <p className="mb-3 text-sm font-medium text-white/85">Devis, bons de livraison, factures</p>
          <div className="h-[320px] overflow-y-auto">
            <DocumentsGlass documents={documents} onChange={rafraichirDocuments} onApercu={setApercuId} />
          </div>
        </GlassPanel>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <GlassPanel intensity="regular" className="p-4">
            <p className="mb-3 text-sm font-medium text-white/85">Caisse — conformité anti-fraude TVA</p>
            <CaisseGlass />
          </GlassPanel>

          <GlassPanel intensity="regular" className="p-4">
            <p className="mb-3 text-sm font-medium text-white/85">Export comptable (FEC)</p>
            <ExportComptableGlass />
          </GlassPanel>
        </div>
      </div>

      <GlassModal open={modalDocument} onClose={() => setModalDocument(false)} title="Nouveau document" maxWidthClassName="max-w-3xl">
        <NouveauDocumentForm
          produits={produits}
          clients={clients}
          onCree={() => {
            setModalDocument(false);
            rafraichirDocuments();
          }}
          onAnnuler={() => setModalDocument(false)}
        />
      </GlassModal>

      <GlassModal open={modalClient} onClose={() => setModalClient(false)} title="Nouveau client">
        <NouveauClientForm
          onCree={(c) => {
            setClients((prev) => [...prev, c]);
            setModalClient(false);
          }}
          onAnnuler={() => setModalClient(false)}
        />
      </GlassModal>

      <GlassModal open={modalParametres} onClose={() => setModalParametres(false)} title="Identité légale du domaine" maxWidthClassName="max-w-2xl">
        <ParametresLegauxForm
          parametres={parametres}
          onEnregistre={(p) => {
            setParametres(p);
            setModalParametres(false);
          }}
        />
      </GlassModal>
      {apercuId && <DocumentApercu documentId={apercuId} parametres={parametres} onClose={() => setApercuId(null)} />}
    </GlassPageShell>
  );
}
