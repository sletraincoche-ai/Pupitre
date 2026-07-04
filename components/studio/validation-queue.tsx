"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Camera, Mail, MessageCircle, Star, Check, Pencil, X, Zap } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { ContentPreviewModal } from "@/components/studio/content-preview-modal";
import { contenusStudio, type ContenuStudio } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const platformIcons: Record<ContenuStudio["plateforme"], typeof Camera> = {
  Instagram: Camera,
  Email: Mail,
  SMS: MessageCircle,
  "Avis Google": Star,
};

export function ValidationQueue() {
  const [items, setItems] = useState(contenusStudio);
  const [leavingIds, setLeavingIds] = useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = useState<ContenuStudio | null>(null);

  function removeItem(id: string) {
    setLeavingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setLeavingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  }

  function handleValider(item: ContenuStudio) {
    toast.success(`Publication validée pour ${item.plateforme}`, {
      description: `Prévue le ${item.date}`,
    });
    removeItem(item.id);
  }

  function handleModifier(item: ContenuStudio) {
    toast.info(`Édition manuelle à venir pour cette publication ${item.plateforme}.`);
  }

  function handleIgnorer(item: ContenuStudio) {
    toast.info("Publication ignorée", {
      description: `${item.plateforme} · ${item.date}`,
    });
    removeItem(item.id);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl text-ink">File de validation</h2>
        <span className="text-sm text-stone">
          {items.length} contenu{items.length > 1 ? "s" : ""} en attente
        </span>
      </div>

      {items.length === 0 && (
        <EmptyState
          icon={Check}
          title="File de validation vide"
          description="Toutes les suggestions ont été traitées. La prochaine arrive avec le brief du lundi."
        />
      )}

      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const Icon = platformIcons[item.plateforme];
          const isLeaving = leavingIds.has(item.id);
          return (
            <Card
              key={item.id}
              className={cn(
                "border border-border/70 bg-card shadow-none transition-all duration-300 ease-out",
                isLeaving ? "translate-x-2 opacity-0" : "opacity-100"
              )}
            >
              <CardHeader className="px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-vine/10 text-vine">
                      <Icon className="size-4" />
                    </span>
                    <CardTitle className="text-base">{item.plateforme}</CardTitle>
                  </div>
                  <Badge variant="outline" className="border-border text-stone">
                    Prévu le {item.date}
                  </Badge>
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-gold">
                  <Zap className="size-3.5" />
                  {item.declencheur}
                </p>
              </CardHeader>
              <CardContent className="px-6">
                <button
                  onClick={() => setPreviewItem(item)}
                  className="block w-full text-left"
                >
                  {item.contexte && (
                    <p className="mb-3 rounded-md border-l-2 border-gold/50 bg-muted/60 px-3 py-2 text-sm italic leading-relaxed text-stone">
                      {item.contexte}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed text-ink hover:underline">
                    {item.texte}
                  </p>
                </button>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="bg-vine text-white hover:bg-vine/90"
                    onClick={() => handleValider(item)}
                  >
                    <Check className="size-3.5" />
                    Valider
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleModifier(item)}
                  >
                    <Pencil className="size-3.5" />
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-stone hover:text-destructive"
                    onClick={() => handleIgnorer(item)}
                  >
                    <X className="size-3.5" />
                    Ignorer
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ContentPreviewModal contenu={previewItem} onClose={() => setPreviewItem(null)} />
    </div>
  );
}
