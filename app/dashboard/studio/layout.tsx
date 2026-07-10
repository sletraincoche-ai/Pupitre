"use client";

import { useAuth } from "@/lib/auth-context";
import { AuthGate } from "@/components/studio/auth/auth-gate";
import { ConnexionsModal } from "@/components/studio/connexions/connexions-modal";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useAuth();

  if (!hydrated) return null;
  if (!user) return <AuthGate />;
  return (
    <>
      {children}
      <ConnexionsModal />
    </>
  );
}
