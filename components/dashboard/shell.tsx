"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { PeriodProvider } from "@/lib/period-context";
import { CaveProvider } from "@/lib/cave-context";
import { ClientsProvider } from "@/lib/clients-context";
import { AuthProvider } from "@/lib/auth-context";
import { IdentityProvider } from "@/lib/identity-context";
import { MetaConnectionProvider } from "@/lib/meta-connection-context";
import { GmailConnectionProvider } from "@/lib/gmail-connection-context";
import { ConnexionsModalProvider } from "@/lib/connexions-modal-context";
import { OnboardingProvider } from "@/lib/onboarding-context";
import { PhotosProvider } from "@/lib/photos-context";
import { PublicationsProvider } from "@/lib/publications-context";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthProvider>
      <PeriodProvider>
        <CaveProvider>
          <ClientsProvider>
            <IdentityProvider>
              <PhotosProvider>
                <PublicationsProvider>
                  <MetaConnectionProvider>
                    <GmailConnectionProvider>
                      <ConnexionsModalProvider>
                        <OnboardingProvider>
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
                        </OnboardingProvider>
                      </ConnexionsModalProvider>
                    </GmailConnectionProvider>
                  </MetaConnectionProvider>
                </PublicationsProvider>
              </PhotosProvider>
            </IdentityProvider>
          </ClientsProvider>
        </CaveProvider>
      </PeriodProvider>
    </AuthProvider>
  );
}
