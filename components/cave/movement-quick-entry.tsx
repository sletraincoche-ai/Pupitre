"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/cave/combobox";
import { AUJOURDHUI, clients, domaineProfile } from "@/lib/mock-data";
import type { Cuvee, Mouvement, MouvementType } from "@/lib/mock-data";
import { toDateKey } from "@/lib/cave";

const origineOptions: Record<Exclude<MouvementType, "sortie">, string[]> = {
  entree: ["Dégorgement", "Retour"],
  perte: ["Casse", "Inventaire"],
};

const titres: Record<MouvementType, string> = {
  sortie: "Nouvelle sortie",
  entree: "Nouvelle entrée",
  perte: "Nouvelle perte",
};

function heureActuelle() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function MovementQuickEntry({
  type,
  cuvees,
  mouvements,
  onCreateCuvee,
  onSubmit,
  onCancel,
}: {
  type: MouvementType;
  cuvees: Cuvee[];
  mouvements: Mouvement[];
  onCreateCuvee: (nom: string) => Cuvee;
  onSubmit: (mouvement: Mouvement) => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<"comptoir" | "client">("comptoir");
  const [cuveeId, setCuveeId] = useState<string | null>(null);
  const [cuveeNom, setCuveeNom] = useState("");
  const [quantite, setQuantite] = useState("");
  const [prixUnitaire, setPrixUnitaire] = useState("");
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [clientNom, setClientNom] = useState("");
  const [origine, setOrigine] = useState(
    type !== "sortie" ? origineOptions[type][0] : ""
  );

  function selectCuvee(cuvee: Cuvee) {
    setCuveeId(cuvee.id);
    setCuveeNom(cuvee.nom);
    if (type === "sortie") setPrixUnitaire(String(cuvee.prixVenteDefaut));
  }

  function creerCuvee(nom: string) {
    const nouvelle = onCreateCuvee(nom);
    selectCuvee(nouvelle);
  }

  function selectClient(id: string) {
    const client = clients.find((c) => c.id === id);
    if (!client) return;
    setClientId(client.id);
    setClientNom(client.nom);
    if (cuveeId) {
      const dernierAchat = [...mouvements]
        .filter((m) => m.clientId === client.id && m.cuveeId === cuveeId && m.prixUnitaire)
        .sort((a, b) => `${b.date}T${b.heure}`.localeCompare(`${a.date}T${a.heure}`))[0];
      if (dernierAchat?.prixUnitaire) setPrixUnitaire(String(dernierAchat.prixUnitaire));
    }
  }

  const quantiteValide = Number(quantite) > 0;
  const peutEnregistrer = !!cuveeId && quantiteValide;

  function handleSubmit() {
    if (!peutEnregistrer || !cuveeId) return;
    const mouvement: Mouvement = {
      id: `m-${Date.now()}`,
      date: toDateKey(AUJOURDHUI),
      heure: heureActuelle(),
      type,
      cuveeId,
      quantite: Number(quantite),
      origine:
        type === "sortie"
          ? mode === "comptoir"
            ? "Vente comptoir"
            : "Vente client"
          : origine,
      ...(type === "sortie" && mode === "client" && clientId
        ? { clientId, clientNom }
        : {}),
      ...(type === "sortie" ? { prixUnitaire: Number(prixUnitaire) || undefined } : {}),
      auteur: domaineProfile.nomVigneron,
    };
    onSubmit(mouvement);
  }

  const cuveeItems = cuvees.map((c) => ({
    id: c.id,
    label: c.nom,
    sublabel: c.millesime !== "NV" ? c.millesime : undefined,
  }));
  const clientItems = clients.map((c) => ({ id: c.id, label: c.nom, sublabel: c.pays }));

  return (
    <div className="rounded-xl border border-gold/40 bg-gold/5 p-4">
      <div className="flex items-center justify-between">
        <p className="font-heading text-base text-ink">{titres[type]}</p>
        <button
          onClick={onCancel}
          aria-label="Annuler"
          className="flex size-7 items-center justify-center rounded-md text-stone hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      </div>

      {type === "sortie" && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setMode("comptoir")}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
              mode === "comptoir"
                ? "border-vine bg-vine text-white"
                : "border-border bg-card text-stone hover:border-vine/40"
            }`}
          >
            Vente comptoir
          </button>
          <button
            onClick={() => setMode("client")}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
              mode === "client"
                ? "border-vine bg-vine text-white"
                : "border-border bg-card text-stone hover:border-vine/40"
            }`}
          >
            Avec client
          </button>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-stone">Cuvée</label>
          <Combobox
            items={cuveeItems}
            initialQuery={cuveeNom}
            onSelect={(item) => {
              const cuvee = cuvees.find((c) => c.id === item.id);
              if (cuvee) selectCuvee(cuvee);
            }}
            onQueryChange={() => setCuveeId(null)}
            placeholder="Rechercher ou créer…"
            allowCreate
            onCreate={creerCuvee}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-stone">Quantité</label>
          <Input
            type="number"
            min={1}
            value={quantite}
            onChange={(e) => setQuantite(e.target.value)}
            placeholder="Bouteilles"
          />
        </div>

        {type === "sortie" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-stone">
              Prix unitaire (€)
            </label>
            <Input
              type="number"
              min={0}
              step="0.5"
              value={prixUnitaire}
              onChange={(e) => setPrixUnitaire(e.target.value)}
            />
          </div>
        )}

        {type === "sortie" && mode === "client" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-stone">Client</label>
            <Combobox
              items={clientItems}
              initialQuery={clientNom}
              onSelect={(item) => selectClient(item.id)}
              placeholder="Rechercher un client…"
              emptyLabel="Aucun client trouvé."
            />
          </div>
        )}

        {type !== "sortie" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-stone">Origine</label>
            <Select value={origine} onValueChange={(value) => value && setOrigine(value)}>
              <SelectTrigger className="w-full text-sm">
                <SelectValue>{() => origine}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {origineOptions[type].map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button
          className="bg-vine text-white hover:bg-vine/90"
          disabled={!peutEnregistrer}
          onClick={handleSubmit}
        >
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
