import { GlassPanel } from "@/components/glass/glass-panel";
import { Badge } from "@/components/ui/badge";

function LinkedinGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56z" />
    </svg>
  );
}

export function LinkedinConnexionGlass() {
  return (
    <GlassPanel intensity="light" className="flex flex-col gap-3 p-6 opacity-80">
      <div className="flex items-center justify-between">
        <span className="flex size-7 items-center justify-center rounded-lg bg-[#0A66C2] text-white">
          <LinkedinGlyph className="size-4" />
        </span>
        <Badge variant="outline" className="border-white/20 text-white/70">
          Bientôt
        </Badge>
      </div>
      <div>
        <p className="text-base font-semibold text-white">LinkedIn</p>
        <p className="text-sm text-white/60">La publication vers LinkedIn arrive dans une prochaine version.</p>
      </div>
    </GlassPanel>
  );
}
