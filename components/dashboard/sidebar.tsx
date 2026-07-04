"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GlassWater,
  Warehouse,
  CalendarDays,
  Sparkles,
  Globe2,
  Settings,
  Wine,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { contenusStudio } from "@/lib/mock-data";
import { ProfileMenu } from "@/components/dashboard/profile-menu";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  badgeLabel?: string;
  disabled?: boolean;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Gestion",
    items: [
      { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
      { href: "/dashboard/clients", label: "Clients", icon: Users },
      { href: "/dashboard/visites", label: "Visites", icon: GlassWater },
      { href: "/dashboard/agenda", label: "Agenda", icon: CalendarDays },
      { href: "/dashboard/cave", label: "Cave", icon: Warehouse },
    ],
  },
  {
    label: "Marketing",
    items: [
      {
        href: "/dashboard/studio",
        label: "Studio IA",
        icon: Sparkles,
        badge: contenusStudio.length,
      },
      {
        href: "/dashboard/international",
        label: "Cap International",
        icon: Globe2,
        badgeLabel: "Bientôt",
        disabled: true,
      },
    ],
  },
  {
    label: "Domaine",
    items: [{ href: "/dashboard/parametres", label: "Paramètres", icon: Settings }],
  },
];

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[0.7rem] font-medium tracking-wider text-white/40 uppercase">
              {group.label}
            </p>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                if (item.disabled) {
                  return (
                    <div
                      key={item.href}
                      className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/35"
                    >
                      <Icon className="size-4" />
                      {item.label}
                      {item.badgeLabel && (
                        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] font-medium text-white/50">
                          {item.badgeLabel}
                        </span>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-gold/15 text-gold"
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
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-3">
        <ProfileMenu onNavigate={onNavigate} />
      </div>
    </>
  );
}

export function DashboardSidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden h-full w-[210px] shrink-0 flex-col bg-vine text-white/90 lg:flex">
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-5">
          <Wine className="size-5 text-gold" />
          <Link href="/dashboard" className="font-heading text-xl tracking-wide text-white">
            PUPITRE
          </Link>
        </div>
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Drawer mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-ink/50 lg:hidden"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-vine text-white/90 lg:hidden"
            >
              <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/10 px-5">
                <Link href="/dashboard" className="font-heading text-xl tracking-wide text-white">
                  PUPITRE
                </Link>
                <button
                  onClick={onCloseMobile}
                  aria-label="Fermer le menu"
                  className="flex size-9 items-center justify-center rounded-md text-white/80"
                >
                  <X className="size-5" />
                </button>
              </div>
              <SidebarContent pathname={pathname} onNavigate={onCloseMobile} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
