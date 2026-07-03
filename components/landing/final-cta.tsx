"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/landing/reveal";

const reassurances = [
  "3 mois d'accès pilote offerts",
  "Sans engagement, résiliable en un clic",
  "Un vigneron vous accompagne à la mise en route",
];

export function FinalCta() {
  const [nom, setNom] = useState("");
  const [domaine, setDomaine] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Demande envoyée !", {
      description: "Nous revenons vers vous sous 48h pour lancer votre pilote.",
    });
    setSubmitted(true);
    setNom("");
    setDomaine("");
    setEmail("");
  }

  return (
    <section id="cta" className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 rounded-2xl bg-vine px-8 py-14 text-white lg:grid-cols-2 lg:items-center lg:px-16">
          <Reveal>
            <h2 className="font-heading text-3xl lg:text-4xl">
              Demandez un accès pilote gratuit — 3 mois.
            </h2>
            <p className="mt-4 max-w-md text-white/70">
              On installe Pupitre avec vous, on reprend vos données, on
              adapte le Studio IA à votre ton. Si ça ne vous convient pas
              après 3 mois, vous partez sans rien devoir.
            </p>
            <ul className="mt-8 flex flex-col gap-3">
              {reassurances.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-white/85">
                  <Check className="size-4 text-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="rounded-xl bg-white p-7 text-ink shadow-2xl">
              {submitted ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-vine/10 text-vine">
                    <Check className="size-6" />
                  </span>
                  <p className="font-heading text-xl text-vine">
                    Demande bien reçue
                  </p>
                  <p className="text-sm text-stone">
                    Nous revenons vers vous sous 48h.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-2 text-sm font-medium text-gold hover:underline"
                  >
                    Envoyer une nouvelle demande
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="nom" className="text-sm font-medium text-ink">
                      Votre nom
                    </label>
                    <Input
                      id="nom"
                      required
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      placeholder="Isabelle Fontaine"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="domaine" className="text-sm font-medium text-ink">
                      Votre domaine
                    </label>
                    <Input
                      id="domaine"
                      required
                      value={domaine}
                      onChange={(e) => setDomaine(e.target.value)}
                      placeholder="Champagne Fontaine"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-ink">
                      E-mail
                    </label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="isabelle@domaine.fr"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="mt-2 h-11 bg-gold text-white hover:bg-gold/90"
                  >
                    Demander un accès pilote gratuit
                  </Button>
                  <p className="text-center text-xs text-stone">
                    En soumettant, vous acceptez notre{" "}
                    <a href="/cookies" className="underline hover:text-vine">
                      politique cookies
                    </a>
                    .
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
