// Chaque asset apparaît sur deux questions (question N et N+6). Fond de
// page entier, débordant des bords. Certains assets (la rangée de
// bouteilles, le cadre de feuilles) ne sont pas des motifs scattered —
// étirés en plein cadre ils deviennent creux au centre. Le pavage en
// tuiles répétées garantit une densité constante quel que soit l'asset
// et quelle que soit la taille de l'écran. Les PNG sont déjà détourés
// (fond blanc rendu transparent) ; mix-blend-mode sert de filet de
// sécurité pour toute frange proche du blanc restante.
const assetParIndex = [
  "/images/test-identite/asset-1.png",
  "/images/test-identite/asset-2.png",
  "/images/test-identite/asset-3.png",
  "/images/test-identite/asset-4.png",
  "/images/test-identite/asset-5.png",
  "/images/test-identite/asset-6.png",
  "/images/test-identite/asset-1.png",
  "/images/test-identite/asset-2.png",
  "/images/test-identite/asset-3.png",
  "/images/test-identite/asset-4.png",
  "/images/test-identite/asset-5.png",
  "/images/test-identite/asset-6.png",
];

export function QuizIllustration({ etapeIndex }: { etapeIndex: number }) {
  const src = assetParIndex[etapeIndex % assetParIndex.length];

  return (
    <div
      className="absolute inset-0 mix-blend-multiply"
      style={{
        backgroundImage: `url(${src})`,
        backgroundRepeat: "repeat",
        backgroundSize: "620px auto",
        backgroundPosition: "center",
      }}
    />
  );
}
