"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "pupitre-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  function respond(choice: "accepted" | "refused") {
    window.localStorage.setItem(STORAGE_KEY, choice);
    setVisible(false);
    toast(
      choice === "accepted"
        ? "Cookies acceptés, merci !"
        : "Cookies non essentiels refusés."
    );
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4"
        >
          <div className="mx-auto flex max-w-4xl flex-col items-start gap-4 rounded-xl border border-border/70 bg-card p-5 shadow-2xl sm:flex-row sm:items-center">
            <p className="flex-1 text-sm text-stone">
              Pupitre utilise des cookies pour mesurer son audience et
              améliorer votre expérience. Vous pouvez accepter ou refuser les
              cookies non essentiels.{" "}
              <Link href="/cookies" className="underline text-vine hover:text-gold">
                En savoir plus
              </Link>
            </p>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => respond("refused")}>
                Refuser
              </Button>
              <Button
                size="sm"
                className="bg-vine text-white hover:bg-vine/90"
                onClick={() => respond("accepted")}
              >
                Accepter
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
