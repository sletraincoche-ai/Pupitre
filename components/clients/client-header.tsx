import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Client } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  VIP: "bg-gold/15 text-gold",
  Actif: "bg-vine/10 text-vine",
  "À relancer": "bg-destructive/10 text-destructive",
};

export function ClientHeader({ client }: { client: Client }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar size="lg">
        <AvatarFallback className="bg-vine/10 text-lg text-vine">
          {client.initiales}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl text-ink">{client.nom}</h1>
          <Badge variant="outline" className={cn("border-transparent", statusStyles[client.statut])}>
            {client.statut}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-stone">
          {client.drapeau} {client.pays} · {client.origine} · {client.email}
        </p>
      </div>
    </div>
  );
}
