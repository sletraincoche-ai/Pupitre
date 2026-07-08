// Motifs discrets en gravure technique — un par catégorie de question,
// jamais une illustration plein écran. Traits fins, une seule couleur
// (héritée du texte via currentColor), jamais de remplissage décoratif.
// Pense planche d'herbier ou schéma de cépage ancien, pas pictogramme.

function Cadran({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" className={className}>
      <circle cx="50" cy="50" r="38" />
      <circle cx="50" cy="50" r="1.6" fill="currentColor" stroke="none" />
      <line x1="50" y1="12" x2="50" y2="20" />
      <line x1="50" y1="80" x2="50" y2="88" />
      <line x1="12" y1="50" x2="20" y2="50" />
      <line x1="80" y1="50" x2="88" y2="50" />
      <line x1="23" y1="23" x2="28" y2="28" />
      <line x1="72" y1="72" x2="77" y2="77" />
      <line x1="77" y1="23" x2="72" y2="28" />
      <line x1="28" y1="72" x2="23" y2="77" />
      <path d="M50 50 L72 30" />
    </svg>
  );
}

function RangsDeVigne({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" className={className}>
      <line x1="50" y1="35" x2="5" y2="92" />
      <line x1="50" y1="35" x2="27" y2="92" />
      <line x1="50" y1="35" x2="50" y2="92" />
      <line x1="50" y1="35" x2="73" y2="92" />
      <line x1="50" y1="35" x2="95" y2="92" />
      <line x1="14" y1="62" x2="86" y2="62" />
      <line x1="6" y1="78" x2="94" y2="78" />
    </svg>
  );
}

function Grappe({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" className={className}>
      <path d="M50 8 C 56 16, 56 21, 50 27" />
      <circle cx="50" cy="34" r="7" />
      <circle cx="38" cy="45" r="7" />
      <circle cx="62" cy="45" r="7" />
      <circle cx="32" cy="58" r="7" />
      <circle cx="50" cy="58" r="7" />
      <circle cx="68" cy="58" r="7" />
      <circle cx="41" cy="71" r="7" />
      <circle cx="59" cy="71" r="7" />
      <circle cx="50" cy="84" r="7" />
    </svg>
  );
}

function FeuilleDeVigne({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" className={className}>
      <path d="M50 14 C 29 19, 14 34, 14 50 C 14 64, 24 74, 35 86 C 41 78, 45 72, 50 69 C 55 72, 59 78, 65 86 C 76 74, 86 64, 86 50 C 86 34, 71 19, 50 14 Z" />
      <path d="M50 14 L50 69" />
      <path d="M50 39 L26 54" />
      <path d="M50 39 L74 54" />
      <path d="M50 54 L31 67" />
      <path d="M50 54 L69 67" />
    </svg>
  );
}

function CadreArgentique({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" className={className}>
      <path d="M15 30 L15 15 L30 15" />
      <path d="M70 15 L85 15 L85 30" />
      <path d="M85 70 L85 85 L70 85" />
      <path d="M30 85 L15 85 L15 70" />
      <circle cx="50" cy="50" r="16" />
      <circle cx="50" cy="50" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

const motifParGroupe: Record<string, (props: { className?: string }) => React.JSX.Element> = {
  Histoire: Cadran,
  "Terroir et parcelles": RangsDeVigne,
  Cuvées: Grappe,
  "Ton et voix": FeuilleDeVigne,
  Photos: CadreArgentique,
};

export function QuizMotif({ groupe, className }: { groupe: string; className?: string }) {
  const Motif = motifParGroupe[groupe] ?? FeuilleDeVigne;
  return <Motif className={className} />;
}
