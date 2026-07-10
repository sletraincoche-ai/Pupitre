"use client";

import { useAuth } from "@/lib/auth-context";
import { AuthGate } from "@/components/studio/auth/auth-gate";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useAuth();

  if (!hydrated) return null;
  if (!user) return <AuthGate />;
  return <>{children}</>;
}
