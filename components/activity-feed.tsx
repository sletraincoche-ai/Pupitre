import {
  ShoppingCart,
  CalendarCheck,
  Sparkles,
  UserRound,
  PackageSearch,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { activites } from "@/lib/mock-data";

const icons: Record<string, typeof ShoppingCart> = {
  commande: ShoppingCart,
  visite: CalendarCheck,
  studio: Sparkles,
  client: UserRound,
  stock: PackageSearch,
};

export function ActivityFeed() {
  return (
    <Card className="border border-border/70 bg-card shadow-none">
      <CardHeader className="px-6">
        <CardTitle>Activité récente</CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <ul className="flex flex-col gap-4">
          {activites.map((activite) => {
            const Icon = icons[activite.type] ?? ShoppingCart;
            return (
              <li key={activite.id} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-vine/10 text-vine">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm text-ink">{activite.texte}</p>
                  <p className="mt-0.5 text-xs text-stone">{activite.temps}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
