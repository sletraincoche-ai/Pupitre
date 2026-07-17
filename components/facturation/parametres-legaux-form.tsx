"use client";

import { useState } from "react";
import { GlassNumberInput } from "@/components/glass/glass-number-input";
import { facturationApi, type ParametresLegaux } from "@/lib/facturation-api";

// Identité légale du domaine — mentions obligatoires sur facture
// (Code de commerce L441-9/L441-10, CGI art. 289). Lus depuis
// cave_parametres, jamais recodés en dur (brief Facturation).
export function ParametresLegauxForm({ parametres, onEnregistre }: { parametres: ParametresLegaux | null; onEnregistre: (p: ParametresLegaux) => void }) {
  const [champ, setChamp] = useState<ParametresLegaux>(
    parametres ?? {
      raison_sociale: "",
      forme_juridique: "",
      capital_social: null,
      siret: "",
      tva_intracommunautaire: "",
      rcs_ville: "",
      adresse: "",
      code_postal: "",
      ville: "",
      pays: "FR",
      iban: "",
      bic: "",
      mention_penalites_retard: "",
    }
  );
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  function set<K extends keyof ParametresLegaux>(cle: K, valeur: ParametresLegaux[K]) {
    setChamp((prev) => ({ ...prev, [cle]: valeur }));
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      const { parametres: enregistres } = await facturationApi.enregistrerParametres(champ);
      onEnregistre(enregistres);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de l'enregistrement.");
    } finally {
      setEnvoi(false);
    }
  }

  const champTexte = (label: string, cle: keyof ParametresLegaux, placeholder = "") => (
    <div className="flex-1">
      <label className="mb-1 block text-xs text-white/55">{label}</label>
      <input
        value={(champ[cle] as string) ?? ""}
        onChange={(e) => set(cle, e.target.value as never)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
      />
    </div>
  );

  return (
    <form onSubmit={soumettre} className="flex flex-col gap-3">
      <div className="flex gap-3">
        {champTexte("Raison sociale", "raison_sociale", "Champagne des Trois Clos")}
        {champTexte("Forme juridique", "forme_juridique", "EARL, EI…")}
      </div>
      <div className="flex gap-3">
        {champTexte("SIRET", "siret", "12345678900012")}
        {champTexte("TVA intracommunautaire", "tva_intracommunautaire", "FR12345678900")}
      </div>
      <div className="flex gap-3">
        {champTexte("RCS + ville", "rcs_ville", "RCS Reims 123 456 789")}
        <div className="flex-1">
          <label className="mb-1 block text-xs text-white/55">Capital social (€)</label>
          <GlassNumberInput value={champ.capital_social ?? 0} onChange={(v) => set("capital_social", v || null)} />
        </div>
      </div>
      {champTexte("Adresse du siège", "adresse")}
      <div className="flex gap-3">
        {champTexte("Code postal", "code_postal")}
        {champTexte("Ville", "ville")}
      </div>
      <div className="flex gap-3">
        {champTexte("IBAN", "iban")}
        {champTexte("BIC", "bic")}
      </div>
      <div>
        <label className="mb-1 block text-xs text-white/55">Mention pénalités de retard (préremplie, éditable)</label>
        <textarea
          value={champ.mention_penalites_retard ?? ""}
          onChange={(e) => set("mention_penalites_retard", e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
        />
      </div>

      {erreur && <p className="text-xs text-red-300">{erreur}</p>}

      <div className="flex justify-end">
        <button type="submit" disabled={envoi} className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50">
          {envoi ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
