"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { caisseApi } from "@/lib/facturation-api";

function moisCourant(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Caisse conforme loi anti-fraude TVA — un ticket est déjà créé
// automatiquement pour chaque vente comptoir (voir lib/cave-server.ts,
// lib/caisse.ts). Ce panneau expose la preuve d'intégrité (chaîne de
// hachage vérifiable) et la clôture mensuelle, exigences ISCA.
export function CaisseGlass() {
  const [valide, setValide] = useState<boolean | null>(null);
  const [premiereAnomalie, setPremiereAnomalie] = useState<number | null>(null);
  const [clotures, setClotures] = useState<{ id: string; type: string; periode: string; total_ttc: number; nombre_tickets: number }[]>([]);
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);

  async function rafraichir() {
    const [v, c] = await Promise.all([caisseApi.verifierChaine(), caisseApi.listerClotures()]);
    setValide(v.valide);
    setPremiereAnomalie(v.premiereAnomalie);
    setClotures(c.clotures);
  }

  useEffect(() => {
    rafraichir().finally(() => setChargement(false));
  }, []);

  async function clturerMoisCourant() {
    setEnvoi(true);
    try {
      await caisseApi.creerCloture("mensuelle", moisCourant());
      await rafraichir();
    } finally {
      setEnvoi(false);
    }
  }

  if (chargement) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${valide ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-red-400/30 bg-red-400/10 text-red-200"}`}>
        {valide ? <ShieldCheck className="size-4 shrink-0" /> : <ShieldAlert className="size-4 shrink-0" />}
        {valide ? "Chaîne de tickets intègre — aucune altération détectée." : `Anomalie détectée au ticket n°${premiereAnomalie}.`}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-white/60">{clotures.length} clôture(s) enregistrée(s)</p>
        <button onClick={clturerMoisCourant} disabled={envoi} className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15 disabled:opacity-50">
          {envoi ? "Clôture…" : `Clôturer ${moisCourant()}`}
        </button>
      </div>

      {clotures.length > 0 && (
        <div className="flex flex-col gap-1">
          {clotures.slice(0, 6).map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs text-white/70">
              <span>
                {c.type} — {c.periode}
              </span>
              <span>
                {c.nombre_tickets} ticket(s) — {c.total_ttc.toFixed(2)} €
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
