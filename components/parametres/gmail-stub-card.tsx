import { SiGmail } from "react-icons/si";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function GmailStubCard() {
  return (
    <Card className="border border-border/70 bg-card opacity-70 shadow-none">
      <CardHeader className="px-6">
        <div className="flex items-center justify-between">
          <span className="flex size-7 items-center justify-center rounded-lg bg-white ring-1 ring-border">
            <SiGmail className="size-4 text-[#EA4335]" />
          </span>
          <Badge variant="outline" className="border-border text-stone">
            Bientôt
          </Badge>
        </div>
        <CardTitle>Gmail</CardTitle>
        <CardDescription>L&apos;envoi depuis votre propre adresse Gmail arrive dans une prochaine version.</CardDescription>
      </CardHeader>
    </Card>
  );
}
