"use client";

import { useState } from "react";
import { clientsApi, type Client, type ProfilClient } from "@/lib/clients-api";

const LABELS_PROFIL: Record<ProfilClient, string> = { particulier: "Particulier", professionnel: "Professionnel", chr: "CHR" };

export function NouveauClientFormGlass({ onCree, onAnnuler }: { onCree: (client: Client) => void; onAnnuler: () => void }) {
  const [nom, setNom] = useState("");
  const [profil, setProfil] = useState<ProfilClient>("particulier");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim()) return setErreur("Nom requis.");
    setEnvoi(true);
    setErreur(null);
    try {
      const { client } = await clientsApi.creer({ nom: nom.trim(), profil, email: email || undefined, telephone: telephone || undefined, origine: "Saisie manuelle" });
      onCree(client);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de la création.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <form onSubmit={soumettre} className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-xs text-white/55">Nom</label>
        <input value={nom} onChange={(e) => setNom(e.target.value)} className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(LABELS_PROFIL) as ProfilClient[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setProfil(p)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${profil === p ? "border-gold/40 bg-gold/20 text-gold" : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"}`}
          >
            {LABELS_PROFIL[p]}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-white/55">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30" />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-white/55">Téléphone</label>
          <input value={telephone} onChange={(e) => setTelephone(e.target.value)} className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30" />
        </div>
      </div>
      {erreur && <p className="text-xs text-red-300">{erreur}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onAnnuler} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
          Annuler
        </button>
        <button type="submit" disabled={envoi} className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50">
          {envoi ? "Création…" : "Créer le client"}
        </button>
      </div>
    </form>
  );
}
