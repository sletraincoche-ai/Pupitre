"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, PanelLeft, Wine, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type GlassNavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

export type GlassNavGroup = {
  label: string;
  items: GlassNavItem[];
};

const EASE = [0.32, 0.72, 0, 1] as const;

function NavLinks({
  groups,
  pathname,
  ouvert,
  onNavigate,
}: {
  groups: GlassNavGroup[];
  pathname: string;
  ouvert: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4">
      {groups.map((groupe) => (
        <div key={groupe.label} className="flex flex-col gap-1">
          {groupe.items.map((item) => {
            const actif = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-[13px] py-3 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white",
                  actif && "bg-white/15 text-white"
                )}
              >
                <Icon className="size-[18px] shrink-0" />
                <AnimatePresence>
                  {ouvert && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="flex flex-1 items-center whitespace-nowrap"
                    >
                      {item.label}
                      {!!item.badge && (
                        <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-destructive text-[0.7rem] font-medium text-white">
                          {item.badge}
                        </span>
                      )}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

// Replié par défaut en rail d'icônes ; survol ou clic le déploie. Ne se
// superpose jamais au contenu : c'est un flex-item normal dont la largeur
// s'anime, donc le contenu voisin est mécaniquement repoussé. Sous lg, le
// rail permanent cèderait trop de place à un écran étroit : il devient un
// tiroir ouvert par un bouton, en superposition (seul cas où le
// recouvrement est acceptable, puisqu'aucun rail n'est jamais visible en
// permanence sur mobile).
export function GlassSidebar({ groups }: { groups: GlassNavGroup[] }) {
  const [epingle, setEpingle] = useState(false);
  const [survole, setSurvole] = useState(false);
  const [tiroirOuvert, setTiroirOuvert] = useState(false);
  const pathname = usePathname();
  const ouvert = epingle || survole;

  return (
    <>
      {/* Desktop : rail permanent qui pousse le contenu */}
      <motion.aside
        onMouseEnter={() => setSurvole(true)}
        onMouseLeave={() => setSurvole(false)}
        animate={{ width: ouvert ? 232 : 76 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="relative z-20 m-4 mr-0 hidden shrink-0 flex-col overflow-hidden rounded-[28px] border border-white/15 bg-black/58 shadow-[0_8px_32px_rgba(0,0,0,0.28)] backdrop-blur-2xl backdrop-saturate-150 lg:flex"
      >
        <div className="flex h-16 shrink-0 items-center gap-3 px-[26px]">
          <Wine className="size-5 shrink-0 text-gold" />
          <AnimatePresence>
            {ouvert && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="font-semibold tracking-tight whitespace-nowrap text-white"
              >
                Pupitre
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <NavLinks groups={groups} pathname={pathname} ouvert={ouvert} />

        <button
          onClick={() => setEpingle((v) => !v)}
          aria-label={epingle ? "Réduire le menu" : "Épingler le menu ouvert"}
          aria-pressed={epingle}
          className="flex h-14 shrink-0 items-center gap-3 border-t border-white/10 px-[26px] text-white/60 transition-colors hover:text-white"
        >
          <PanelLeft className="size-[18px] shrink-0" />
          <AnimatePresence>
            {ouvert && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="text-xs whitespace-nowrap"
              >
                {epingle ? "Réduire" : "Épingler"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.aside>

      {/* Mobile : bouton flottant + tiroir en superposition */}
      <button
        onClick={() => setTiroirOuvert(true)}
        aria-label="Ouvrir le menu"
        className="fixed top-5 left-5 z-30 flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white shadow-[0_8px_32px_rgba(0,0,0,0.28)] backdrop-blur-xl backdrop-saturate-150 lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <AnimatePresence>
        {tiroirOuvert && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-30 bg-black/40 lg:hidden"
              onClick={() => setTiroirOuvert(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: EASE }}
              className="fixed inset-y-4 left-4 z-40 flex w-64 flex-col overflow-hidden rounded-[28px] border border-white/15 bg-black/70 shadow-[0_8px_32px_rgba(0,0,0,0.28)] backdrop-blur-2xl backdrop-saturate-150 lg:hidden"
            >
              <div className="flex h-16 shrink-0 items-center justify-between gap-3 px-5">
                <span className="flex items-center gap-2">
                  <Wine className="size-5 shrink-0 text-gold" />
                  <span className="font-semibold tracking-tight text-white">Pupitre</span>
                </span>
                <button
                  onClick={() => setTiroirOuvert(false)}
                  aria-label="Fermer le menu"
                  className="flex size-8 items-center justify-center rounded-full text-white/70 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>
              <NavLinks groups={groups} pathname={pathname} ouvert onNavigate={() => setTiroirOuvert(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
