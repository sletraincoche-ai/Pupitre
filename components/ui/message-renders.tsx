// Rendus réels partagés d'un SMS et d'un e-mail — utilisés partout où
// l'app doit montrer le message exact envoyé, jamais une description
// stylisée de son statut (règle 0.6).

export function SmsBubbleRendu({
  texte,
  label = "SMS envoyé",
}: {
  texte: string;
  label?: string;
}) {
  return (
    <div className="mx-auto max-w-xs rounded-3xl border border-border/70 bg-background p-4">
      <p className="mb-3 text-center text-xs text-stone">{label}</p>
      <div className="rounded-2xl rounded-bl-sm bg-vine px-4 py-3 text-sm text-white">
        {texte}
      </div>
    </div>
  );
}

export function EmailInboxRendu({
  texte,
  de,
  a,
  objet,
}: {
  texte: string;
  de: string;
  a: string;
  objet: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/70">
      <div className="space-y-1 border-b border-border/60 bg-muted/40 px-4 py-3 text-xs text-stone">
        <p>
          <span className="font-medium text-ink">De :</span> {de}
        </p>
        <p>
          <span className="font-medium text-ink">À :</span> {a}
        </p>
        <p>
          <span className="font-medium text-ink">Objet :</span> {objet}
        </p>
      </div>
      <div className="px-4 py-4 text-sm leading-relaxed text-ink">{texte}</div>
    </div>
  );
}
