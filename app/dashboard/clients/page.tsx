"use client";

import { useEffect, useState } from "react";
import { Plus, Upload } from "lucide-react";
import { GlassPageShell } from "@/components/glass/glass-page-shell";
import { GlassPanel } from "@/components/glass/glass-panel";
import { GlassModal } from "@/components/glass/glass-modal";
import { ListeClientsGlass } from "@/components/clients/liste-clients-glass";
import { NouveauClientFormGlass } from "@/components/clients/nouveau-client-form-glass";
import { ImportCsvGlass } from "@/components/clients/import-csv-glass";
import { clientsApi, type ClientAvecStats } from "@/lib/clients-api";

// Reconstruction réelle de Clients — lit le registre de Cave et les
// documents Facturation existants, ne duplique aucun historique (voir
// mémoire projet_pupitre_clients). lib/clients-context.tsx (mock) reste
// utilisé tel quel par Studio IA (mail/creation) — hors périmètre de ce
// chantier, volontairement non touché.
export default function ClientsPage() {
  const [clients, setClients] = useState<ClientAvecStats[]>([]);
  const [chargement, setChargement] = useState(true);
  const [modalClient, setModalClient] = useState(false);
  const [modalImport, setModalImport] = useState(false);

  async function rafraichir() {
    const { clients } = await clientsApi.lister();
    setClients(clients);
  }

  useEffect(() => {
    rafraichir().finally(() => setChargement(false));
  }, []);

  if (chargement) return null;

  return (
    <GlassPageShell>
      <div className="flex flex-col gap-4 pb-10">
        <GlassPanel intensity="strong" className="shrink-0 px-4 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-semibold tracking-tight text-white">Clients</p>
              <p className="truncate text-xs text-white/70">Fiches réelles, historique lu depuis Cave et Facturation.</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => setModalImport(true)}
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15"
              >
                <Upload className="size-3.5" />
                Importer CSV
              </button>
              <button onClick={() => setModalClient(true)} className="flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-xs font-medium text-ink hover:bg-gold/90">
                <Plus className="size-3.5" />
                Nouveau client
              </button>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel intensity="regular" className="p-4">
          <ListeClientsGlass clients={clients} />
        </GlassPanel>
      </div>

      <GlassModal open={modalClient} onClose={() => setModalClient(false)} title="Nouveau client">
        <NouveauClientFormGlass
          onCree={() => {
            setModalClient(false);
            rafraichir();
          }}
          onAnnuler={() => setModalClient(false)}
        />
      </GlassModal>

      <ImportCsvGlass open={modalImport} onClose={() => setModalImport(false)} onImporte={rafraichir} />
    </GlassPageShell>
  );
}
