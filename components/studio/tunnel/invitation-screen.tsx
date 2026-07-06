import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function InvitationScreen({
  onPlusTard,
  onFaireLeTest,
}: {
  onPlusTard: () => void;
  onFaireLeTest: () => void;
}) {
  return (
    <Card className="mx-auto max-w-xl border border-border/70 bg-card shadow-none">
      <CardContent className="flex flex-col items-center gap-4 px-6 py-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-gold/10 text-gold">
          <Sparkles className="size-6" />
        </span>
        <p className="font-heading text-xl text-ink">Un dernier pas avant de commencer</p>
        <p className="max-w-md text-sm leading-relaxed text-stone">
          Le test d&apos;identité prend 15 à 20 minutes et permet un contenu bien plus adapté à votre
          domaine — il vous fera gagner des heures ensuite. Fortement recommandé, mais vous pouvez
          aussi le faire plus tard.
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
          <Button variant="ghost" onClick={onPlusTard}>
            Plus tard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
