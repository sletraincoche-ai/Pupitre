"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronsUpDown, UserRound, CircleHelp, LogOut } from "lucide-react";
import { domaineProfile } from "@/lib/mock-data";
import { useClickOutside } from "@/lib/use-click-outside";
import { cn } from "@/lib/utils";

export function ProfileMenu({ onNavigate }: { onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      {open && (
        <div className="absolute inset-x-0 bottom-full mb-2 overflow-hidden rounded-lg border border-white/10 bg-vine shadow-xl">
          <Link
            href="/dashboard/parametres"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white"
          >
            <UserRound className="size-4" />
            Profil du domaine
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              toast.info("Le centre d'aide arrive bientôt.");
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white"
          >
            <CircleHelp className="size-4" />
            Aide
          </button>
          <button
            onClick={() => {
              setOpen(false);
              toast.success("Déconnexion effectuée.");
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/5 hover:text-destructive"
          >
            <LogOut className="size-4" />
            Déconnexion
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/5",
          open && "bg-white/5"
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-medium text-white">
          {domaineProfile.initiales}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-white">
            {domaineProfile.nomDomaine}
          </span>
          <span className="block truncate text-xs text-white/50">
            {domaineProfile.nomVigneron}
          </span>
        </span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-white/40" />
      </button>
    </div>
  );
}
