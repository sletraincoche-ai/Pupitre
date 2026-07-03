"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/breadcrumb";
import { GlobalSearch } from "@/components/dashboard/global-search";
import { NotificationsMenu } from "@/components/dashboard/notifications-menu";
import { PeriodSelect } from "@/components/dashboard/period-select";

const PERIOD_ROUTES = ["/dashboard", "/dashboard/visites"];

export function DashboardTopbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const pathname = usePathname();
  const showPeriod = PERIOD_ROUTES.includes(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/70 bg-background px-4 lg:px-6">
      <button
        onClick={onOpenMobile}
        aria-label="Ouvrir le menu"
        className="flex size-9 shrink-0 items-center justify-center rounded-md text-ink lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="min-w-0 shrink-0">
        <Breadcrumb />
      </div>

      <div className="hidden flex-1 justify-center md:flex">
        <GlobalSearch />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {showPeriod && (
          <div className="hidden sm:block">
            <PeriodSelect />
          </div>
        )}
        <NotificationsMenu />
      </div>
    </header>
  );
}
