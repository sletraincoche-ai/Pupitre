"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toDateKey } from "@/lib/cave";
import type { EvenementPersonnel } from "@/lib/agenda";

export function PersonnelForm({
  open,
  defaultDate,
  onClose,
  onSubmit,
}: {
  open: boolean;
  defaultDate: Date;
  onClose: () => void;
  onSubmit: (event: EvenementPersonnel) => void;
}) {
  const [titre, setTitre] = useState("");
  const [date, setDate] = useState(toDateKey(defaultDate));
  const [note, setNote] = useState("");

  function reset() {
    setTitre("");
    setDate(toDateKey(defaultDate));
    setNote("");
  }

  function handleSubmit() {
    if (!titre.trim() || !date) return;
    onSubmit({
      id: `perso-${Date.now()}`,
      categorie: "personnel",
      titre: titre.trim(),
      date,
      note: note.trim() || undefined,
    });
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Ajouter un rendez-vous personnel"
      maxWidthClassName="max-w-sm"
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-stone">Titre</label>
          <Input
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="RDV fournisseur, salon…"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-stone">Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-stone">Note (facultatif)</label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Détail utile" />
        </div>
        <Button
          className="mt-1 bg-vine text-white hover:bg-vine/90"
          disabled={!titre.trim()}
          onClick={handleSubmit}
        >
          Ajouter
        </Button>
      </div>
    </Modal>
  );
}
