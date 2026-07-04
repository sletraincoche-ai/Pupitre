import { SiInstagram, SiFacebook } from "react-icons/si";
import { cn } from "@/lib/utils";

// Vraies icônes de marque (simple-icons via react-icons) — jamais de
// forme générique pour représenter une plateforme. Le dégradé Instagram
// et le bleu Facebook (#1877F2) reproduisent les icônes d'app officielles :
// glyphe blanc sur fond de marque, pas un glyphe coloré sur fond blanc.

export function InstagramBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-lg bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#4F5BD5]",
        className
      )}
    >
      <SiInstagram className="size-[60%] text-white" />
    </span>
  );
}

export function FacebookBadge({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center justify-center rounded-lg bg-[#1877F2]", className)}>
      <SiFacebook className="size-[60%] text-white" />
    </span>
  );
}
