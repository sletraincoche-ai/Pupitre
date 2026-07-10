import Link from "next/link";
import { Sparkles } from "lucide-react";
import { GlassPanel } from "@/components/glass/glass-panel";
import { GlassSheen } from "@/components/glass/glass-sheen";
import { Button } from "@/components/ui/button";

export function InvitationScreen({
  onPlusTard,
  onFaireLeTest,
}: {
  onPlusTard: () => void;
  onFaireLeTest: () => void;
}) {
  return (
    <GlassPanel intensity="strong" className="relative mx-auto max-w-xl overflow-hidden">
      <GlassSheen />
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 py-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-gold/15 text-gold">
          <Sparkles className="size-6" />
        </span>
        <p className="font-heading text-xl text-white">Un dernier pas avant de commencer</p>
        <p className="max-w-md text-sm leading-relaxed text-white/70">
          Le test d&apos;identité prend 15 à 20 minutes et permet un contenu bien plus adapté à votre
          domaine, avec des heures gagnées ensuite. Fortement recommandé, mais vous pouvez aussi le
          faire plus tard.
        </p>
        <div className="mt-2 flex gap-2">
          <Button
            className="bg-gold text-white hover:bg-gold/90"
            nativeButton={false}
            render={
              <Link href="/dashboard/studio/identite" onClick={onFaireLeTest}>
                Faire le test
              </Link>
            }
          />
          <Button
            variant="ghost"
            className="text-white/80 hover:bg-white/10 hover:text-white"
            onClick={onPlusTard}
          >
            Plus tard
          </Button>
        </div>
      </div>
    </GlassPanel>
  );
}
