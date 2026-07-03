"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChampagneBottles } from "@/components/landing/champagne-bottles";
import { AnimatedCounter } from "@/components/landing/animated-counter";

const stats = [
  { value: 1800, suffix: "", label: "vignerons RM en Champagne" },
  { value: 0, suffix: "%", label: "de commission sur vos ventes" },
  { value: 10, suffix: " min", label: "de gestion par semaine" },
];

function scrollTo(id: string) {
  document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <ChampagneBottles />
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 lg:pt-28 lg:pb-24">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-sm font-medium tracking-[0.2em] text-gold uppercase"
          >
            Fait pour les vignerons récoltants-manipulants
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-heading text-5xl leading-[1.08] text-vine lg:text-[3.6rem]"
          >
            Votre maison mérite mieux qu&apos;un cahier et un tableur.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-stone"
          >
            Pupitre pilote votre clientèle, votre communication et votre
            œnotourisme — sans vous transformer en community manager. Vous
            restez au chai, Pupitre s&apos;occupe du reste.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Button
              size="lg"
              className="h-12 bg-gold px-7 text-base text-white hover:bg-gold/90"
              onClick={() => scrollTo("#cta")}
            >
              Demander un accès pilote
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-vine/30 px-7 text-base text-vine hover:bg-vine/5"
              onClick={() => scrollTo("#demo")}
            >
              Voir la démo
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-20 grid grid-cols-1 gap-8 border-t border-border/70 pt-10 sm:grid-cols-3 lg:max-w-2xl"
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-heading text-4xl text-vine">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-sm text-stone">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
