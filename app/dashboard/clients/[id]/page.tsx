"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { ClientHeader } from "@/components/clients/client-header";
import { ClientStats } from "@/components/clients/client-stats";
import { ClientNotes } from "@/components/clients/client-notes";
import { MovementsTable } from "@/components/cave/movements-table";
import { EmptyState } from "@/components/empty-state";
import { useCave } from "@/lib/cave-context";
import { useClients } from "@/lib/clients-context";
import { visites } from "@/lib/mock-data";
import { getMouvementsClient, getStatsClient } from "@/lib/clients";

export default function ClientFichePage() {
  const params = useParams<{ id: string }>();
  const { cuvees, mouvements } = useCave();
  const { clients } = useClients();
  const [note, setNote] = useState("");

  const client = clients.find((c) => c.id === params.id);

  if (!client) {
    return (
      <div className="flex flex-col gap-6">
        <Link href="/dashboard/clients" className="flex w-fit items-center gap-1.5 text-sm text-stone hover:text-vine">
          <ArrowLeft className="size-4" />
          Retour aux clients
        </Link>
        <EmptyState
          icon={Users}
          title="Client introuvable"
          description="Cette fiche n'existe pas ou plus."
          actionLabel="Retour aux clients"
          actionHref="/dashboard/clients"
        />
      </div>
    );
  }

  const stats = getStatsClient(client.id, mouvements, visites);
  const mouvementsClient = getMouvementsClient(client.id, mouvements);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard/clients" className="flex w-fit items-center gap-1.5 text-sm text-stone hover:text-vine">
        <ArrowLeft className="size-4" />
        Retour aux clients
      </Link>

      <ClientHeader client={client} />
      <ClientStats {...stats} />

      <div>
        <h2 className="mb-3 font-heading text-xl text-ink">
          Registre de la Cave — filtré sur {client.nom}
        </h2>
        <MovementsTable
          mouvements={mouvementsClient}
          cuvees={cuvees}
          emptyLabel="Aucun mouvement enregistré pour ce client."
        />
      </div>

      <ClientNotes value={note} onChange={setNote} />
    </div>
  );
}
