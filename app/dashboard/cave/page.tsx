"use client";

import { useEffect, useState } from "react";
import { Plus, Settings2 } from "lucide-react";
import { GlassPageShell } from "@/components/glass/glass-page-shell";
import { GlassPanel } from "@/components/glass/glass-panel";
import { GlassModal } from "@/components/glass/glass-modal";
import { StockGlass } from "@/components/cave/stock-glass";
import { RegistreGlass } from "@/components/cave/registre-glass";
import { SaisieMouvement } from "@/components/cave/saisie-mouvement";
import { NouveauProduitForm } from "@/components/cave/nouveau-produit-form";
import { ExportDrmGlass } from "@/components/cave/export-drm-glass";
import { CapsulesGlass } from "@/components/cave/capsules-glass";
import { caveApi, type Produit, type Mouvement, type LigneStock } from "@/lib/cave-api";

// Reconstruction réelle de Cave — remplace l'ancienne simulation
// (lib/mock-data.ts Cuvee/Mouvement, components/cave/* d'origine).
// Ce fichier est le seul point du chantier "Cave" à avoir été
// entièrement rebranché sur le vrai backend (voir mémoire
// projet_pupitre_cave) : lib/cave-context.tsx et lib/mock-data.ts
// restent utilisés tels quels par Agenda/Visites/Clients/dashboard —
// hors périmètre de ce chantier, sauf la vente rapide en dégustation
// (components/visites/quick-sale-modal.tsx), rebranchée sur cette même
// API à la demande explicite de l'utilisateur (écriture uniquement).
type VueRegistre = "semaine" | "mois";

function moisCourant(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function ilYA7Jours(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}

export default function CavePage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [mouvements, setMouvements] = useState<Mouvement[]>([]);
  const [stock, setStock] = useState<LigneStock[]>([]);
  const [numeroAgrement, setNumeroAgrement] = useState<string | null>(null);
  const [numeroAgrementSaisie, setNumeroAgrementSaisie] = useState("");
  const [chargement, setChargement] = useState(true);
  const [modalProduit, setModalProduit] = useState(false);
  const [modalParametres, setModalParametres] = useState(false);
  const [vueRegistre, setVueRegistre] = useState<VueRegistre>("mois");

  async function rafraichirMouvements(vue: VueRegistre) {
    const m = await caveApi.listerMouvements(vue === "mois" ? { mois: moisCourant() } : { depuis: ilYA7Jours() });
    setMouvements(m.mouvements);
  }

  async function rafraichirTout() {
    const [p, s, params] = await Promise.all([caveApi.listerProduits(), caveApi.stock(), caveApi.parametres()]);
    setProduits(p.produits);
    setStock(s.stock);
    setNumeroAgrement(params.numeroAgrement);
    await rafraichirMouvements(vueRegistre);
  }

  useEffect(() => {
    rafraichirTout().finally(() => setChargement(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changerVueRegistre(vue: VueRegistre) {
    setVueRegistre(vue);
    rafraichirMouvements(vue);
  }

  async function enregistrerAgrement(e: React.FormEvent) {
    e.preventDefault();
    const { numeroAgrement: enregistre } = await caveApi.enregistrerNumeroAgrement(numeroAgrementSaisie);
    setNumeroAgrement(enregistre);
    setModalParametres(false);
  }

  if (chargement) return null;

  return (
    <GlassPageShell>
      <div className="flex flex-col gap-4 pb-10">
        <GlassPanel intensity="strong" className="shrink-0 px-4 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-semibold tracking-tight text-white">Cave</p>
              <p className="truncate text-xs text-white/70">
                Le registre de vos mouvements — moteur du stock et de la DRM DTI+.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => setModalParametres(true)}
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15"
              >
                <Settings2 className="size-3.5" />
                {numeroAgrement ?? "Agrément"}
              </button>
              <button
                onClick={() => setModalProduit(true)}
                className="flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-xs font-medium text-ink hover:bg-gold/90"
              >
                <Plus className="size-3.5" />
                Nouvelle cuvée
              </button>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel intensity="regular" className="p-4">
          <p className="mb-3 text-sm font-medium text-white/85">Stock en cave</p>
          <StockGlass
            stock={stock}
            produits={produits}
            onProduitModifie={(p) => setProduits((prev) => prev.map((x) => (x.id === p.id ? p : x)))}
          />
        </GlassPanel>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <GlassPanel intensity="regular" className="p-4 lg:col-span-2">
            <p className="mb-3 text-sm font-medium text-white/85">Enregistrer un mouvement</p>
            {produits.length === 0 ? (
              <p className="text-sm text-white/60">Créez d&apos;abord une cuvée pour saisir un mouvement.</p>
            ) : (
              <SaisieMouvement
                produits={produits}
                onCree={(m) => {
                  setMouvements((prev) => [m, ...prev]);
                  caveApi.stock().then((s) => setStock(s.stock));
                }}
              />
            )}
          </GlassPanel>

          <GlassPanel intensity="regular" className="p-4 lg:col-span-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-white/85">Registre</p>
              <div className="flex gap-1 rounded-full border border-white/15 bg-white/5 p-0.5">
                {(["semaine", "mois"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => changerVueRegistre(v)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      vueRegistre === v ? "bg-gold text-ink" : "text-white/70 hover:text-white"
                    }`}
                  >
                    {v === "semaine" ? "Semaine" : "Mois"}
                  </button>
                ))}
              </div>
            </div>
            {/* Hauteur fixe (~3 lignes) — le défilement au-delà reste
                interne au bloc, il ne pousse jamais le reste de la page. */}
            <div className="h-[190px] overflow-y-auto">
              <RegistreGlass
                mouvements={mouvements}
                onAnnule={(m) => {
                  setMouvements((prev) => prev.map((x) => (x.id === m.id ? m : x)));
                  caveApi.stock().then((s) => setStock(s.stock));
                }}
              />
            </div>
          </GlassPanel>
        </div>

        <GlassPanel intensity="regular" className="p-4">
          <p className="mb-3 text-sm font-medium text-white/85">Capsules représentatives de droits (CRD)</p>
          <CapsulesGlass />
        </GlassPanel>

        <GlassPanel intensity="regular" className="p-4">
          <p className="mb-3 text-sm font-medium text-white/85">Export DRM — format DTI+</p>
          <ExportDrmGlass numeroAgrement={numeroAgrement} />
        </GlassPanel>
      </div>

      <GlassModal open={modalProduit} onClose={() => setModalProduit(false)} title="Nouvelle cuvée">
        <NouveauProduitForm
          onCree={(p) => {
            setProduits((prev) => [...prev, p]);
            setModalProduit(false);
          }}
          onAnnuler={() => setModalProduit(false)}
        />
      </GlassModal>

      <GlassModal open={modalParametres} onClose={() => setModalParametres(false)} title="Numéro d'agrément">
        <form onSubmit={enregistrerAgrement} className="flex flex-col gap-3">
          <p className="text-xs text-white/60">13 caractères — 2 lettres puis 11 lettres/chiffres (ex : FR012345E6789).</p>
          <input
            defaultValue={numeroAgrement ?? ""}
            onChange={(e) => setNumeroAgrementSaisie(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
          />
          <div className="flex justify-end">
            <button type="submit" className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink hover:bg-gold/90">
              Enregistrer
            </button>
          </div>
        </form>
      </GlassModal>
    </GlassPageShell>
  );
}
