"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  GlassWater,
  Wine,
  Menu,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { contenusStudio } from "@/lib/mock-data";

const items = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  {
    href: "/dashboard/studio",
    label: "Studio IA",
    icon: Sparkles,
    badge: contenusStudio.length,
  },
  { href: "/dashboard/visites", label: "Œnotourisme", icon: GlassWater },
];

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-6">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-gold text-white"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon className="size-4" />
            {item.label}
            {!!item.badge && (
              <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-destructive text-[0.7rem] font-medium text-white">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Topbar mobile */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/70 bg-vine px-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Wine className="size-5 text-gold" />
          <span className="font-heading text-xl tracking-wide text-white">PUPITRE</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="flex size-9 items-center justify-center rounded-md text-white"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Sidebar desktop */}
      <aside className="hidden h-full w-64 shrink-0 flex-col bg-vine text-white/90 lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
          <Wine className="size-5 text-gold" />
          <Link href="/" className="font-heading text-xl tracking-wide text-white">
            PUPITRE
          </Link>
        </div>
        <SidebarNav pathname={pathname} />
        <div className="border-t border-white/10 px-6 py-4 text-xs text-white/50">
          Maison Pupitre — Pilote v1
        </div>
      </aside>

      {/* Drawer mobile */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-ink/50 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-vine text-white/90 lg:hidden"
            >
              <div className="flex h-16 items-center justify-between gap-2 border-b border-white/10 px-6">
                <span className="font-heading text-xl tracking-wide text-white">
                  PUPITRE
                </span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Fermer le menu"
                  className="flex size-9 items-center justify-center rounded-md text-white/80"
                >
                  <X className="size-5" />
                </button>
              </div>
              <SidebarNav pathname={pathname} onNavigate={() => setOpen(false)} />
              <div className="border-t border-white/10 px-6 py-4 text-xs text-white/50">
                Maison Pupitre — Pilote v1
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
