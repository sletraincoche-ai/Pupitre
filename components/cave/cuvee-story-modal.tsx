"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useIdentity } from "@/lib/identity-context";
import type { Cuvee } from "@/lib/mock-data";

export function CuveeStoryModal({ cuvee, onClose }: { cuvee: Cuvee | null; onClose: () => void }) {
  const { ajouterEnrichissement } = useIdentity();
  const [texte, setTexte] = useState("");

  function enregistrer() {
    if (!texte.trim() || !cuvee) return;
    ajouterEnrichissement(`${cuvee.nom} : ${texte.trim()}`, "cuvee");
    toast.success("Ajouté à votre charte narrative");
    setTexte("");
    onClose();
  }

  return (
    <Modal
      open={!!cuvee}
      onClose={onClose}
      title={cuvee ? `Racontez l'histoire de ${cuvee.nom}` : ""}
      maxWidthClassName="max-w-md"
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-stone">
          Facultatif — ce que vous écrivez enrichit la charte narrative utilisée par le Studio.
        </p>
        <textarea
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          rows={3}
          placeholder="D'où vient cette cuvée, pourquoi ce nom, ce qui la rend particulière…"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-ink outline-none placeholder:text-stone focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Plus tard
          </Button>
          <Button className="bg-vine text-white hover:bg-vine/90" onClick={enregistrer}>
            Enregistrer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
