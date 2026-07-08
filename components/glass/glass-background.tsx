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
      {/* Voile neutre additionnel pour garantir la lisibilité du texte des
          blocs même sur les zones les plus claires de la photo (ciel,
          reflets de soleil) — indépendant de l'opacité de chaque bloc. */}
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
}
