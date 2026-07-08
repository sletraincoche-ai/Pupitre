"use client";

import { Users } from "lucide-react";

export type EmailEdite = {
  objet: string;
  corps: string;
  segment: string;
  nombreDestinataires: number;
};

export const segmentsDisponibles = [
  { tag: "dormant" as const, label: "Clients dormants" },
  { tag: "pro" as const, label: "Clients Pros" },
  { tag: "fidele" as const, label: "Clients Fidèles" },
  { tag: "etranger" as const, label: "Clients Étrangers" },
  { tag: null, label: "Tous les clients" },
];

export function MailEditPanel({
  edited,
  onChange,
  onChangerSegment,
}: {
  edited: EmailEdite;
  onChange: (next: EmailEdite) => void;
  onChangerSegment: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="mb-2 block text-xs font-medium tracking-wide text-stone uppercase">
          Objet
        </label>
        <input
          value={edited.objet}
          onChange={(e) => onChange({ ...edited, objet: e.target.value })}
          placeholder="Objet de l'e-mail"
          className="h-9 w-full rounded-[3px] border border-input bg-background px-3 text-sm text-ink outline-none placeholder:text-stone focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium tracking-wide text-stone uppercase">
          Corps
        </label>
        <textarea
          value={edited.corps}
          onChange={(e) => onChange({ ...edited, corps: e.target.value })}
          rows={6}
          placeholder="Écrivez votre e-mail…"
          className="w-full rounded-[3px] border border-input bg-background px-3 py-2 text-sm text-ink outline-none placeholder:text-stone focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium tracking-wide text-stone uppercase">
          Destinataires
        </label>
        <div className="flex items-center gap-2 rounded-[3px] border border-border bg-background px-3 py-2">
          <Users className="size-4 text-gold" />
          <span className="flex-1 text-sm text-ink">
            {edited.segment} — {edited.nombreDestinataires} contact
            {edited.nombreDestinataires > 1 ? "s" : ""}
          </span>
          <button onClick={onChangerSegment} className="text-sm font-medium text-vine hover:underline">
            Changer
          </button>
        </div>
      </div>
    </div>
  );
}
