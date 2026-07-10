import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Pupitre — Le pilote de votre maison de champagne",
  description:
    "Pupitre centralise votre CRM, votre studio de contenu IA et votre œnotourisme dans un seul tableau de bord, pensé pour les vignerons indépendants champenois.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
