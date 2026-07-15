"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Euro, Wine, ShoppingBag, Users } from "lucide-react";
import { GlassPageShell } from "@/components/glass/glass-page-shell";
import { GlassPanel } from "@/components/glass/glass-panel";
import { GlassEmptyState } from "@/components/glass/glass-empty-state";
import { NotesClientGlass } from "@/components/clients/notes-client-glass";
import { clientsApi, type Client, type AchatClient, type DocumentClient, type StatsClient } from "@/lib/clients-api";

const LABELS_DOC: Record<DocumentClient["type"], string> = { devis: "Devis", bon_livraison: "Bon de livraison", facture: "Facture", avoir: "Avoir" };

// Dette technique résolue (2026-07-15) : cette page lisait auparavant
// le stock mock (lib/cave-context.tsx) et le contexte clients mock —
// voir mémoire projet_pupitre_cave pour l'historique de la décision de
// report. Elle interroge maintenant /api/clients/[id], qui lit
// directement le registre de Cave (cave_mouvements) et les documents
// Facturation existants — aucune table d'historique parallèle créée.
export default function ClientFichePage() {
  const params = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [achats, setAchats] = useState<AchatClient[]>([]);
  const [documents, setDocuments] = useState<DocumentClient[]>([]);
  const [stats, setStats] = useState<StatsClient | null>(null);
  const [segments, setSegments] = useState<string[]>([]);
  const [chargement, setChargement] = useState(true);
  const [introuvable, setIntrouvable] = useState(false);

  useEffect(() => {
    clientsApi
      .obtenir(params.id)
      .then((r) => {
        setClient(r.client);
        setAchats(r.achats);
        setDocuments(r.documents);
        setStats(r.stats);
        setSegments(r.segments);
      })
      .catch(() => setIntrouvable(true))
      .finally(() => setChargement(false));
  }, [params.id]);

  if (chargement) return null;

  if (introuvable || !client || !stats) {
    return (
      <GlassPageShell>
        <div className="flex flex-col gap-4">
          <Link href="/dashboard/clients" className="flex w-fit items-center gap-1.5 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="size-4" />
            Retour aux clients
          </Link>
          <GlassPanel intensity="regular" className="p-2">
            <GlassEmptyState icon={Users} title="Client introuvable" description="Cette fiche n'existe pas ou plus." />
          </GlassPanel>
        </div>
      </GlassPageShell>
    );
  }

  return (
    <GlassPageShell>
      <div className="flex flex-col gap-4 pb-10">
        <Link href="/dashboard/clients" className="flex w-fit items-center gap-1.5 text-sm text-white/70 hover:text-white">
          <ArrowLeft className="size-4" />
          Retour aux clients
        </Link>

        <GlassPanel intensity="strong" className="px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-medium text-white">
              {client.nom.split(/\s+/).slice(0, 2).map((m) => m[0]?.toUpperCase()).join("")}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold text-white">{client.nom}</p>
                {segments.map((s) => (
                  <span key={s} className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs text-white/70">
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-0.5 text-xs text-white/60">
                {client.email ?? "—"} {client.telephone ? `· ${client.telephone}` : ""} · {client.profil}
              </p>
            </div>
          </div>
        </GlassPanel>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <GlassPanel intensity="regular" className="p-4">
            <span className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-gold">
              <Euro className="size-4" />
            </span>
            <p className="mt-3 font-heading text-2xl text-white">{stats.montantTotal.toFixed(0)} €</p>
            <p className="mt-1 text-xs text-white/55">Total dépensé</p>
          </GlassPanel>
          <GlassPanel intensity="regular" className="p-4">
            <span className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-gold">
              <ShoppingBag className="size-4" />
            </span>
            <p className="mt-3 font-heading text-2xl text-white">{stats.nombreAchats}</p>
            <p className="mt-1 text-xs text-white/55">Achats</p>
          </GlassPanel>
          <GlassPanel intensity="regular" className="p-4">
            <span className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-gold">
              <Wine className="size-4" />
            </span>
            <p className="mt-3 font-heading text-2xl text-white">{stats.bouteillesAchetees}</p>
            <p className="mt-1 text-xs text-white/55">Bouteilles achetées</p>
          </GlassPanel>
        </div>

        <GlassPanel intensity="regular" className="p-4">
          <p className="mb-3 text-sm font-medium text-white/85">Registre de Cave — filtré sur {client.nom}</p>
          {achats.length === 0 ? (
            <p className="text-sm text-white/50">Aucun mouvement enregistré pour ce client.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {achats.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">
                      {a.cave_produits?.nom ?? "Cuvée"} {a.cave_produits?.millesime ? `(${a.cave_produits.millesime})` : ""}
                    </p>
                    <p className="text-xs text-white/55">
                      {a.quantite_bouteilles} bout. {a.montant ? `— ${a.montant.toFixed(2)} €` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-white/50">{new Date(a.horodatage).toLocaleDateString("fr-FR")}</span>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>

        <GlassPanel intensity="regular" className="p-4">
          <p className="mb-3 text-sm font-medium text-white/85">Documents Facturation</p>
          {documents.length === 0 ? (
            <p className="text-sm text-white/50">Aucun devis/facture pour ce client.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {documents.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">
                      {LABELS_DOC[d.type]} {d.numero ? `— ${d.numero}` : "(brouillon)"}
                    </p>
                    <p className="text-xs text-white/55">{d.total_ttc.toFixed(2)} € TTC — {d.statut}</p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-white/50">{new Date(d.created_at).toLocaleDateString("fr-FR")}</span>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>

        <GlassPanel intensity="regular" className="p-4">
          <p className="mb-3 text-sm font-medium text-white/85">Notes libres</p>
          <NotesClientGlass clientId={client.id} valeurInitiale={client.notes} />
        </GlassPanel>
      </div>
    </GlassPageShell>
  );
}
