import { Inbox } from "lucide-react";
import { domaineProfile } from "@/lib/mock-data";

export function InboxPreview({ objet, corps }: { objet: string; corps: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-2.5 text-xs text-stone">
        <Inbox className="size-3.5" />
        Boîte de réception
      </div>

      <div className="flex items-start gap-3 border-b border-border/50 px-5 py-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-gold to-vine text-sm font-medium text-white">
          {domaineProfile.initiales}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate font-medium text-ink">{domaineProfile.nomDomaine}</p>
            <span className="shrink-0 text-xs text-stone">maintenant</span>
          </div>
          <p className="truncate text-xs text-stone">{domaineProfile.email}</p>
        </div>
      </div>

      <div className="px-5 py-4">
        <p className="mb-3 font-heading text-lg text-ink">{objet || "(Sans objet)"}</p>
        <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{corps}</p>
        <p className="mt-6 text-sm text-stone">
          Bien cordialement,
          <br />
          <span className="font-medium text-ink">{domaineProfile.nomVigneron}</span>
          <br />
          {domaineProfile.nomDomaine}
        </p>
      </div>
    </div>
  );
}
