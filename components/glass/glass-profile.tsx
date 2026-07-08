"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { UserRound, CircleHelp, LogOut } from "lucide-react";
import { domaineProfile } from "@/lib/mock-data";
import { useClickOutside } from "@/lib/use-click-outside";

export function GlassProfile() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu du profil"
        className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-black/30 text-sm font-medium text-white shadow-[0_8px_32px_rgba(0,0,0,0.28)] backdrop-blur-xl backdrop-saturate-150"
      >
        {domaineProfile.initiales}
      </button>

      {open && (
        <div className="absolute top-full right-0 z-40 mt-2 w-56 overflow-hidden rounded-2xl border border-white/15 bg-black/60 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl backdrop-saturate-150">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="truncate text-sm font-medium text-white">{domaineProfile.nomDomaine}</p>
            <p className="truncate text-xs text-white/55">{domaineProfile.nomVigneron}</p>
          </div>
          <Link
            href="/dashboard/parametres"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white"
          >
            <UserRound className="size-4" />
            Profil du domaine
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              toast.info("Le centre d'aide arrive bientôt.");
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/10 hover:text-white"
          >
            <CircleHelp className="size-4" />
            Aide
          </button>
          <button
            onClick={() => {
              setOpen(false);
              toast.success("Déconnexion effectuée.");
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/10 hover:text-destructive"
          >
            <LogOut className="size-4" />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
