"use client";

import { usePathname } from "next/navigation";
import QRCode from "react-qr-code";
import { GlassModal } from "@/components/glass/glass-modal";

export function MetaQrModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/auth/meta/start?retour=${encodeURIComponent(pathname)}`
      : "";

  return (
    <GlassModal open={open} onClose={onClose} title="Scanner depuis votre téléphone" maxWidthClassName="max-w-sm">
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <p className="text-sm text-white/70">
          Ouvrez l&apos;appareil photo de votre téléphone et visez ce code pour connecter Instagram
          et Facebook depuis cet appareil.
        </p>
        {url && (
          <div className="rounded-xl border border-white/15 bg-white p-4">
            <QRCode value={url} size={180} />
          </div>
        )}
      </div>
    </GlassModal>
  );
}
