"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { clients, type Client, type ClientTag } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type FilterKey = "tous" | ClientTag;

const filters: { key: FilterKey; label: string }[] = [
  { key: "tous", label: "Tous" },
  { key: "fidele", label: "Fidèles" },
  { key: "dormant", label: "Dormants" },
  { key: "etranger", label: "Étrangers" },
  { key: "pro", label: "Pros" },
];

const statusStyles: Record<string, string> = {
  VIP: "bg-gold/15 text-gold",
  Actif: "bg-vine/10 text-vine",
  "À relancer": "bg-destructive/10 text-destructive",
};

function relancer(client: Client) {
  toast.success(`Relance envoyée à ${client.nom}`, {
    description: "E-mail de réactivation programmé.",
  });
}

function voirFiche(client: Client) {
  toast.info(`Fiche ouverte : ${client.nom}`);
}

function ClientActions({ client }: { client: Client }) {
  return (
    <>
      {client.tags.includes("dormant") && (
        <Button
          size="sm"
          className="bg-gold text-white hover:bg-gold/90"
          onClick={() => relancer(client)}
        >
          Relancer
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={() => voirFiche(client)}>
        Voir la fiche
      </Button>
    </>
  );
}

export function CrmView() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("tous");

  const filteredClients = useMemo(() => {
    if (activeFilter === "tous") return clients;
    return clients.filter((client) => client.tags.includes(activeFilter));
  }, [activeFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-vine bg-vine text-white"
                  : "border-border bg-card text-stone hover:border-vine/40 hover:text-vine"
              )}
            >
              {filter.label}
            </button>
          );
        })}
        <span className="ml-auto text-sm text-stone">
          {filteredClients.length} client{filteredClients.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Tableau (>= 640px) */}
      <div className="hidden overflow-hidden rounded-xl border border-border/70 bg-card sm:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Client</TableHead>
              <TableHead>Pays</TableHead>
              <TableHead>Origine</TableHead>
              <TableHead>Dernier achat</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="pr-6 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="pl-6">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-vine/10 text-vine">
                        {client.initiales}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-ink">{client.nom}</p>
                      <p className="text-xs text-stone">{client.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="whitespace-nowrap">
                    {client.drapeau} {client.pays}
                  </span>
                </TableCell>
                <TableCell className="text-stone">{client.origine}</TableCell>
                <TableCell className="text-stone">
                  {client.derniereCommande}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("border-transparent", statusStyles[client.statut])}
                  >
                    {client.statut}
                  </Badge>
                </TableCell>
                <TableCell className="pr-6">
                  <div className="flex justify-end gap-2">
                    <ClientActions client={client} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredClients.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-stone">
                  Aucun client dans ce segment.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Cartes empilées (< 640px) */}
      <div className="flex flex-col gap-3 sm:hidden">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="rounded-xl border border-border/70 bg-card p-4"
          >
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarFallback className="bg-vine/10 text-vine">
                  {client.initiales}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{client.nom}</p>
                <p className="truncate text-xs text-stone">{client.email}</p>
              </div>
              <Badge
                variant="outline"
                className={cn("shrink-0 border-transparent", statusStyles[client.statut])}
              >
                {client.statut}
              </Badge>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-sm">
              <dt className="text-stone">Pays</dt>
              <dd className="text-right text-ink">
                {client.drapeau} {client.pays}
              </dd>
              <dt className="text-stone">Origine</dt>
              <dd className="text-right text-ink">{client.origine}</dd>
              <dt className="text-stone">Dernier achat</dt>
              <dd className="text-right text-ink">{client.derniereCommande}</dd>
            </dl>
            <div className="mt-4 flex justify-end gap-2">
              <ClientActions client={client} />
            </div>
          </div>
        ))}
        {filteredClients.length === 0 && (
          <p className="rounded-xl border border-dashed border-border/70 bg-card py-10 text-center text-stone">
            Aucun client dans ce segment.
          </p>
        )}
      </div>
    </div>
  );
}
