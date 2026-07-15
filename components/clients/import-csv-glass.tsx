"use client";

import { useRef, useState } from "react";
import { UploadCloud, Check } from "lucide-react";
import { GlassModal } from "@/components/glass/glass-modal";
import { parseCsv, deviner } from "@/lib/csv";
import { clientsApi } from "@/lib/clients-api";

type Mapping = { nom: number | null; email: number | null; telephone: number | null; pays: number | null };

const CHAMPS: { cle: keyof Mapping; label: string; requis: boolean }[] = [
  { cle: "nom", label: "Nom", requis: true },
  { cle: "email", label: "E-mail", requis: false },
  { cle: "telephone", label: "Téléphone", requis: false },
  { cle: "pays", label: "Pays", requis: false },
];

// Dédoublonnage réel (email, ou nom+téléphone) effectué côté serveur
// contre les vraies données existantes — voir app/api/clients/import.
// Ce composant ne fait que le dépôt/mapping, pas de pré-calcul de
// doublons en mémoire qui pourrait être périmé.
export function ImportCsvGlass({ open, onClose, onImporte }: { open: boolean; onClose: () => void; onImporte: () => void }) {
  const [etape, setEtape] = useState<"depot" | "correspondance" | "resultat">("depot");
  const [entetes, setEntetes] = useState<string[]>([]);
  const [lignes, setLignes] = useState<string[][]>([]);
  const [nomFichier, setNomFichier] = useState("");
  const [mapping, setMapping] = useState<Mapping>({ nom: null, email: null, telephone: null, pays: null });
  const [envoi, setEnvoi] = useState(false);
  const [resultat, setResultat] = useState<{ importes: number; doublons: number; incomplets: number } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function fermer() {
    setEtape("depot");
    setEntetes([]);
    setLignes([]);
    setMapping({ nom: null, email: null, telephone: null, pays: null });
    setResultat(null);
    setErreur(null);
    onClose();
  }

  async function handleFichier(file: File) {
    const texte = await file.text();
    const { entetes: e, lignes: l } = parseCsv(texte);
    if (e.length === 0 || l.length === 0) {
      setErreur("Fichier vide ou illisible.");
      return;
    }
    setNomFichier(file.name);
    setEntetes(e);
    setLignes(l);
    setMapping({
      nom: deviner(e, ["nom", "name"]),
      email: deviner(e, ["email", "mail"]),
      telephone: deviner(e, ["tel", "phone", "portable", "mobile"]),
      pays: deviner(e, ["pays", "country"]),
    });
    setErreur(null);
    setEtape("correspondance");
  }

  async function importer() {
    setEnvoi(true);
    setErreur(null);
    try {
      const lignesMappees = lignes.map((ligne) => ({
        nom: mapping.nom !== null ? (ligne[mapping.nom] ?? "") : "",
        email: mapping.email !== null ? ligne[mapping.email] : undefined,
        telephone: mapping.telephone !== null ? ligne[mapping.telephone] : undefined,
        pays: mapping.pays !== null ? ligne[mapping.pays] : undefined,
      }));
      const r = await clientsApi.importer(lignesMappees);
      setResultat(r);
      setEtape("resultat");
      onImporte();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de l'import.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <GlassModal open={open} onClose={fermer} title="Importer des clients (CSV)">
      {etape === "depot" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-white/70">Déposez un fichier .csv existant, ou choisissez-le.</p>
          <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFichier(e.target.files[0])} />
          <button
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFichier(file);
            }}
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 px-6 py-10 text-center hover:border-gold/40"
          >
            <UploadCloud className="size-6 text-gold" />
            <p className="text-sm font-medium text-white">Déposer un fichier .csv</p>
            <p className="text-xs text-white/50">ou cliquez pour parcourir</p>
          </button>
          {erreur && <p className="text-xs text-red-300">{erreur}</p>}
        </div>
      )}

      {etape === "correspondance" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-white/70">
            {nomFichier} — {lignes.length} ligne{lignes.length > 1 ? "s" : ""} détectée{lignes.length > 1 ? "s" : ""}. Faites correspondre vos colonnes.
          </p>
          {CHAMPS.map((champ) => (
            <div key={champ.cle} className="flex items-center justify-between gap-3">
              <span className="text-sm text-white">
                {champ.label}
                {champ.requis && <span className="text-red-300"> *</span>}
              </span>
              <select
                value={mapping[champ.cle] !== null ? String(mapping[champ.cle]) : "aucune"}
                onChange={(e) => setMapping((m) => ({ ...m, [champ.cle]: e.target.value === "aucune" ? null : Number(e.target.value) }))}
                className="h-9 w-52 rounded-lg border border-white/15 bg-white/10 px-2 text-sm text-white outline-none"
              >
                <option value="aucune" className="bg-ink">
                  Aucune colonne
                </option>
                {entetes.map((entete, index) => (
                  <option key={entete + index} value={index} className="bg-ink">
                    {entete}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {erreur && <p className="text-xs text-red-300">{erreur}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={() => setEtape("depot")} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
              Précédent
            </button>
            <button
              onClick={importer}
              disabled={mapping.nom === null || envoi}
              className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50"
            >
              {envoi ? "Import…" : `Importer ${lignes.length} ligne${lignes.length > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      )}

      {etape === "resultat" && resultat && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
            <Check className="size-4" />
            {resultat.importes} contact{resultat.importes > 1 ? "s" : ""} importé{resultat.importes > 1 ? "s" : ""}
          </div>
          {resultat.doublons > 0 && (
            <p className="text-xs text-amber-200/80">{resultat.doublons} doublon(s) détecté(s) (email ou nom+téléphone déjà présent) — ignoré(s).</p>
          )}
          {resultat.incomplets > 0 && <p className="text-xs text-white/50">{resultat.incomplets} ligne(s) incomplète(s) (nom ou coordonnée manquante) — ignorée(s).</p>}
          <div className="flex justify-end">
            <button onClick={fermer} className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink hover:bg-gold/90">
              Fermer
            </button>
          </div>
        </div>
      )}
    </GlassModal>
  );
}
