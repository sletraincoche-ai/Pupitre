import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function LegalPageShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
          <Link href="/" className="font-heading text-xl text-vine">
            PUPITRE
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-stone hover:text-vine"
          >
            <ArrowLeft className="size-4" />
            Retour au site
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-heading text-4xl text-vine">{title}</h1>
        <p className="mt-2 text-sm text-stone">Dernière mise à jour : {updated}</p>
        <div className="prose-legal mt-10 flex flex-col gap-8 text-[0.95rem] leading-relaxed text-ink">
          {children}
        </div>
      </main>
    </div>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-heading text-xl text-vine">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-stone">{children}</div>
    </section>
  );
}
