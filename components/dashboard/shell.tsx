"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { PeriodProvider } from "@/lib/period-context";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <PeriodProvider>
      <div className="flex h-screen flex-1 overflow-hidden bg-background">
        <DashboardSidebar
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar onOpenMobile={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto px-5 py-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </PeriodProvider>
  );
}
