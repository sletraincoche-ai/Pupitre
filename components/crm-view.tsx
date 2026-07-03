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
import { clients, type ClientTag } from "@/lib/mock-data";
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

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
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
                    {client.tags.includes("dormant") && (
                      <Button
                        size="sm"
                        className="bg-gold text-white hover:bg-gold/90"
                        onClick={() =>
                          toast.success(`Relance envoyée à ${client.nom}`, {
                            description: "E-mail de réactivation programmé.",
                          })
                        }
                      >
                        Relancer
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast.success(`Fiche ouverte : ${client.nom}`)
                      }
                    >
                      Voir la fiche
                    </Button>
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
    </div>
  );
}
