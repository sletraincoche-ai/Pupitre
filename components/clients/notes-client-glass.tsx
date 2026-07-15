"use client";

import { useState } from "react";
import { clientsApi } from "@/lib/clients-api";

// Persistance réelle (colonne clients.notes) — l'ancien ClientNotes
// gardait la note en state local uniquement, perdue au rechargement.
export function NotesClientGlass({ clientId, valeurInitiale }: { clientId: string; valeurInitiale: string | null }) {
  const [valeur, setValeur] = useState(valeurInitiale ?? "");
  const [envoi, setEnvoi] = useState(false);
  const [enregistre, setEnregistre] = useState(false);

  async function enregistrer() {
    setEnvoi(true);
    try {
      await clientsApi.modifier(clientId, { notes: valeur });
      setEnregistre(true);
      setTimeout(() => setEnregistre(false), 2000);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={valeur}
        onChange={(e) => setValeur(e.target.value)}
        rows={4}
        placeholder="Préférences, anecdotes, contexte utile au prochain contact…"
        className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/30"
      />
      <button
        onClick={enregistrer}
        disabled={envoi}
        className="self-start rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs text-white/80 hover:bg-white/15 disabled:opacity-50"
      >
        {envoi ? "Enregistrement…" : enregistre ? "Enregistré ✓" : "Enregistrer la note"}
      </button>
    </div>
  );
}
