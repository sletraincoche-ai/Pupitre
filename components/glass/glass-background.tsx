import Image from "next/image";

export function GlassBackground({ src, alt = "" }: { src: string; alt?: string }) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        quality={92}
        sizes="100vw"
        className="object-cover"
      />
      {/* Voile dégradé (plus sombre en bas, plus léger en haut) plutôt
          qu'un aplat uniforme — garantit la lisibilité du texte des blocs
          même sur les zones les plus claires de la photo (ciel, reflets
          de soleil), tout en restant cohérent avec la lumière naturelle
          de la scène (horizon clair, sol plus sombre). Indépendant de
          l'opacité de chaque bloc. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/15 to-black/40" />
    </div>
  );
}
