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
        <label className="mb-2 block text-xs font-medium tracking-wide text-white/60 uppercase">
          Objet
        </label>
        <input
          value={edited.objet}
          onChange={(e) => onChange({ ...edited, objet: e.target.value })}
          placeholder="Objet de l'e-mail"
          className="h-9 w-full rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white outline-none placeholder:text-white/40 focus-visible:border-white/40 focus-visible:ring-3 focus-visible:ring-white/20"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium tracking-wide text-white/60 uppercase">
          Corps
        </label>
        <textarea
          value={edited.corps}
          onChange={(e) => onChange({ ...edited, corps: e.target.value })}
          rows={6}
          placeholder="Écrivez votre e-mail…"
          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus-visible:border-white/40 focus-visible:ring-3 focus-visible:ring-white/20"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium tracking-wide text-white/60 uppercase">
          Destinataires
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2">
          <Users className="size-4 text-gold" />
          <span className="flex-1 text-sm text-white">
            {edited.segment} — {edited.nombreDestinataires} contact
            {edited.nombreDestinataires > 1 ? "s" : ""}
          </span>
          <button onClick={onChangerSegment} className="text-sm font-medium text-gold hover:underline">
            Changer
          </button>
        </div>
      </div>
    </div>
  );
}
