"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "#probleme", label: "Le constat" },
  { href: "#solution", label: "La solution" },
  { href: "#demo", label: "Démo" },
  { href: "#copilote", label: "Copilote IA" },
  { href: "#pricing", label: "Tarifs" },
  { href: "#temoignages", label: "Vignerons" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleAnchorClick(href: string) {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/70 bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/80"
          : "border-b border-transparent bg-background/0"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-2xl tracking-wide text-vine">
            PUPITRE
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <button
              key={link.href}
              onClick={() => handleAnchorClick(link.href)}
              className="rounded-md px-3 py-2 text-sm font-medium text-stone transition-colors hover:text-vine"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            className="bg-gold text-white hover:bg-gold/90"
            onClick={() => handleAnchorClick("#cta")}
          >
            Demander un accès pilote
          </Button>
        </div>

        <button
          className="flex size-9 items-center justify-center rounded-md text-vine lg:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Ouvrir le menu"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-b border-border/70 bg-background lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {links.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleAnchorClick(link.href)}
                  className="rounded-md px-2 py-2.5 text-left text-sm font-medium text-stone hover:text-vine"
                >
                  {link.label}
                </button>
              ))}
              <Button
                className="mt-2 bg-gold text-white hover:bg-gold/90"
                onClick={() => handleAnchorClick("#cta")}
              >
                Demander un accès pilote
              </Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
