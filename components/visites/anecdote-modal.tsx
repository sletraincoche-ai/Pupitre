"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useIdentity } from "@/lib/identity-context";
import type { Visite } from "@/lib/mock-data";

export function AnecdoteModal({
  visite,
  onClose,
  onEnregistrer,
}: {
  visite: Visite | null;
  onClose: () => void;
  onEnregistrer: (visiteId: string, note: string) => void;
}) {
  const { ajouterEnrichissement } = useIdentity();
  const [texte, setTexte] = useState("");

  useEffect(() => {
    setTexte(visite?.noteAnecdote ?? "");
  }, [visite]);

  function enregistrer() {
    if (!visite) return;
    const etaitVide = !visite.noteAnecdote;
    onEnregistrer(visite.id, texte.trim());
    if (etaitVide && texte.trim()) {
      ajouterEnrichissement(`Visite de ${visite.client} (${visite.date}) : ${texte.trim()}`, "visite");
      toast.success("Ajouté à votre charte narrative");
    } else {
      toast.success("Note enregistrée");
    }
    onClose();
  }

  return (
    <Modal
      open={!!visite}
      onClose={onClose}
      title="Note ou anecdote de cette visite"
      maxWidthClassName="max-w-md"
    >
      {visite && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-stone">
            {visite.client} — {visite.date}. Réutilisable par l&apos;IA pour enrichir votre charte narrative.
          </p>
          <textarea
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            rows={3}
            placeholder="Un moment marquant, une réaction, une anecdote de cette visite…"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-ink outline-none placeholder:text-stone focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button className="bg-vine text-white hover:bg-vine/90" onClick={enregistrer}>
              Enregistrer
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
