"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const onglets = [
  { href: "/dashboard/studio/reseaux-sociaux", label: "réseaux sociaux" },
  { href: "/dashboard/studio/mail", label: "mail" },
  { href: "/dashboard/studio/avis", label: "avis google" },
];

export function BinderTabs() {
  const pathname = usePathname();

  return (
    <div className="flex border-b border-border">
      {onglets.map((onglet) => {
        const actif = pathname === onglet.href;
        return (
          <Link
            key={onglet.href}
            href={onglet.href}
            className={cn(
              "-mb-px border-t-2 px-5 py-3 font-heading text-base transition-colors",
              actif
                ? "border-t-vine border-x border-x-border bg-card text-ink"
                : "border-t-transparent text-stone hover:text-ink"
            )}
          >
            {onglet.label}
          </Link>
        );
      })}
    </div>
  );
}
