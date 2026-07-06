"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HeroCard } from "@/components/visites/hero-card";
import { RetreatList } from "@/components/visites/retreat-list";
import { QuickSaleModal } from "@/components/visites/quick-sale-modal";
import { ConfirmationModal } from "@/components/visites/confirmation-modal";
import { AnecdoteModal } from "@/components/visites/anecdote-modal";
import { ConfigurationTab } from "@/components/visites/configuration-tab";
import { useCave } from "@/lib/cave-context";
import { visites as visitesInitiales, type Visite } from "@/lib/mock-data";
import { getProchaineVisite } from "@/lib/visites";

export default function VisitesPage() {
  const { mouvements } = useCave();
  const [visites, setVisites] = useState(visitesInitiales);
  const [venteVisite, setVenteVisite] = useState<Visite | null>(null);
  const [confirmationVisite, setConfirmationVisite] = useState<Visite | null>(null);
  const [anecdoteVisite, setAnecdoteVisite] = useState<Visite | null>(null);

  const prochaine = getProchaineVisite(visites);
  const autres = visites.filter((v) => v.id !== prochaine?.id);

  function enregistrerAnecdote(visiteId: string, note: string) {
    setVisites((prev) => prev.map((v) => (v.id === visiteId ? { ...v, noteAnecdote: note } : v)));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl text-ink">Visites</h1>
        <p className="mt-1 text-stone">
          Le mode accueil du jour — qui arrive, et une vente à un clic de la dégustation.
        </p>
      </div>

      <Tabs defaultValue="accueil">
        <TabsList variant="line">
          <TabsTrigger value="accueil">Accueil du jour</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="accueil" className="mt-6">
          <div className="flex flex-col gap-6">
            <HeroCard
              visite={prochaine}
              mouvements={mouvements}
              toutesLesVisites={visites}
              onOuvrirVente={() => prochaine && setVenteVisite(prochaine)}
              onOuvrirConfirmation={() => prochaine && setConfirmationVisite(prochaine)}
            />

            <div>
              <h3 className="mb-3 text-sm font-medium tracking-wide text-stone uppercase">
                Visites passées et à venir
              </h3>
              <RetreatList
                visites={autres}
                mouvements={mouvements}
                toutesLesVisites={visites}
                onOuvrirConfirmation={setConfirmationVisite}
                onOuvrirAnecdote={setAnecdoteVisite}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="mt-6">
          <ConfigurationTab />
        </TabsContent>
      </Tabs>

      <QuickSaleModal visite={venteVisite} onClose={() => setVenteVisite(null)} />
      <ConfirmationModal visite={confirmationVisite} onClose={() => setConfirmationVisite(null)} />
      <AnecdoteModal
        visite={anecdoteVisite}
        onClose={() => setAnecdoteVisite(null)}
        onEnregistrer={enregistrerAnecdote}
      />
    </div>
  );
}
