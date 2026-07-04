"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { UploadCloud, AlertTriangle, Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Client } from "@/lib/mock-data";
import {
  parseCsv,
  analyserLignes,
  construireClients,
  type Mapping,
  type LigneImport,
} from "@/lib/import-clients";

type Etape = "depot" | "correspondance" | "nettoyage" | "apercu";

const champsCibles: { cle: keyof Mapping; label: string; requis: boolean }[] = [
  { cle: "nom", label: "Nom", requis: true },
  { cle: "email", label: "E-mail", requis: true },
  { cle: "pays", label: "Pays", requis: false },
];

export function ImportWizard({
  open,
  onClose,
  clientsExistants,
  onImporter,
}: {
  open: boolean;
  onClose: () => void;
  clientsExistants: Client[];
  onImporter: (nouveaux: Client[]) => void;
}) {
  const [etape, setEtape] = useState<Etape>("depot");
  const [entetes, setEntetes] = useState<string[]>([]);
  const [lignes, setLignes] = useState<string[][]>([]);
  const [nomFichier, setNomFichier] = useState("");
  const [mapping, setMapping] = useState<Mapping>({ nom: null, email: null, pays: null });
  const [lignesAnalysees, setLignesAnalysees] = useState<LigneImport[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function reinitialiser() {
    setEtape("depot");
    setEntetes([]);
    setLignes([]);
    setNomFichier("");
    setMapping({ nom: null, email: null, pays: null });
    setLignesAnalysees([]);
  }

  function fermer() {
    reinitialiser();
    onClose();
  }

  async function handleFichier(file: File) {
    const texte = await file.text();
    const { entetes: e, lignes: l } = parseCsv(texte);
    if (e.length === 0 || l.length === 0) {
      toast.error("Fichier vide ou illisible");
      return;
    }
    setNomFichier(file.name);
    setEntetes(e);
    setLignes(l);
    // Correspondance assistée : devine la colonne par son intitulé
    const deviner = (motsCles: string[]) =>
      e.findIndex((entete) => motsCles.some((mot) => entete.toLowerCase().includes(mot)));
    const nomCol = deviner(["nom", "name"]);
    const emailCol = deviner(["email", "mail"]);
    const paysCol = deviner(["pays", "country"]);
    setMapping({
      nom: nomCol >= 0 ? nomCol : null,
      email: emailCol >= 0 ? emailCol : null,
      pays: paysCol >= 0 ? paysCol : null,
    });
    setEtape("correspondance");
  }

  function confirmerMapping() {
    const analysees = analyserLignes(lignes, mapping, clientsExistants);
    setLignesAnalysees(analysees);
    setEtape("nettoyage");
  }

  const valides = lignesAnalysees.filter((l) => !l.incomplete && !l.doublon);
  const doublons = lignesAnalysees.filter((l) => l.doublon);
  const incompletes = lignesAnalysees.filter((l) => l.incomplete && !l.doublon);

  function importer() {
    const nouveaux = construireClients(lignesAnalysees);
    onImporter(nouveaux);
    toast.success(`${nouveaux.length} contact${nouveaux.length > 1 ? "s" : ""} importé${nouveaux.length > 1 ? "s" : ""}`, {
      description: nomFichier,
    });
    fermer();
  }

  return (
    <Modal open={open} onClose={fermer} title="Importer des clients" maxWidthClassName="max-w-lg">
      {etape === "depot" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-stone">
            Glissez-déposez votre fichier Excel/CSV existant, ou choisissez-le.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFichier(e.target.files[0])}
          />
          <button
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFichier(file);
            }}
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/70 bg-background px-6 py-10 text-center hover:border-gold/50"
          >
            <UploadCloud className="size-6 text-gold" />
            <p className="text-sm font-medium text-ink">Déposer un fichier .csv</p>
            <p className="text-xs text-stone">ou cliquez pour parcourir</p>
          </button>
        </div>
      )}

      {etape === "correspondance" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-stone">
            {nomFichier} · {lignes.length} ligne{lignes.length > 1 ? "s" : ""} détectée{lignes.length > 1 ? "s" : ""}.
            Faites correspondre vos colonnes.
          </p>
          {champsCibles.map((champ) => (
            <div key={champ.cle} className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-ink">
                {champ.label}
                {champ.requis && <span className="text-destructive"> *</span>}
              </span>
              <Select
                value={mapping[champ.cle] !== null ? String(mapping[champ.cle]) : "aucune"}
                onValueChange={(value) =>
                  setMapping((m) => ({ ...m, [champ.cle]: value === "aucune" ? null : Number(value) }))
                }
              >
                <SelectTrigger className="w-56 text-sm">
                  <SelectValue>
                    {() =>
                      mapping[champ.cle] !== null ? entetes[mapping[champ.cle] as number] : "Aucune colonne"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aucune">Aucune colonne</SelectItem>
                  {entetes.map((entete, index) => (
                    <SelectItem key={entete + index} value={String(index)}>
                      {entete}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEtape("depot")}>
              Précédent
            </Button>
            <Button
              className="bg-vine text-white hover:bg-vine/90"
              disabled={mapping.nom === null || mapping.email === null}
              onClick={confirmerMapping}
            >
              Continuer
            </Button>
          </div>
        </div>
      )}

      {etape === "nettoyage" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-vine/30 bg-vine/5 px-3 py-2 text-sm text-vine">
            <Check className="size-4" />
            {valides.length} contact{valides.length > 1 ? "s" : ""} prêt{valides.length > 1 ? "s" : ""} à importer
          </div>
          {doublons.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/5 px-3 py-2 text-sm text-gold">
              <AlertTriangle className="size-4" />
              {doublons.length} doublon{doublons.length > 1 ? "s" : ""} détecté{doublons.length > 1 ? "s" : ""}
              (e-mail déjà présent) — ignoré{doublons.length > 1 ? "s" : ""}
            </div>
          )}
          {incompletes.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="size-4" />
              {incompletes.length} ligne{incompletes.length > 1 ? "s" : ""} incomplète{incompletes.length > 1 ? "s" : ""}
              (nom ou e-mail manquant) — ignorée{incompletes.length > 1 ? "s" : ""}
            </div>
          )}
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEtape("correspondance")}>
              Précédent
            </Button>
            <Button
              className="bg-vine text-white hover:bg-vine/90"
              disabled={valides.length === 0}
              onClick={() => setEtape("apercu")}
            >
              Continuer
            </Button>
          </div>
        </div>
      )}

      {etape === "apercu" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-stone">
            Aperçu avant confirmation — {valides.length} contact{valides.length > 1 ? "s" : ""}
          </p>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-border/70">
            {valides.map((l, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 border-b border-border/50 px-3 py-2 text-sm last:border-b-0"
              >
                <div>
                  <p className="font-medium text-ink">{l.nom}</p>
                  <p className="text-xs text-stone">{l.email}</p>
                </div>
                {l.pays && <Badge variant="outline">{l.pays}</Badge>}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEtape("nettoyage")}>
              Précédent
            </Button>
            <Button className="bg-vine text-white hover:bg-vine/90" onClick={importer}>
              Importer {valides.length} contact{valides.length > 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
