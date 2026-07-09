"use client";

import { GlassPageShell } from "@/components/glass/glass-page-shell";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassImageBank } from "@/components/studio/glass-image-bank";

export default function PhotosPage() {
  return (
    <GlassPageShell>
      <GlassPageHeader
        title="Banque d'images"
        subtitle="Les photos disponibles pour illustrer vos publications."
      />
      <GlassImageBank />
    </GlassPageShell>
  );
}
