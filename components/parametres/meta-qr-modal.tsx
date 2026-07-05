"use client";

import QRCode from "react-qr-code";
import { Modal } from "@/components/ui/modal";

export function MetaQrModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/api/auth/meta/start` : "";

  return (
    <Modal open={open} onClose={onClose} title="Scanner depuis votre téléphone" maxWidthClassName="max-w-sm">
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <p className="text-sm text-stone">
          Ouvrez l&apos;appareil photo de votre téléphone et visez ce code pour connecter Instagram
          et Facebook depuis cet appareil.
        </p>
        {url && (
          <div className="rounded-xl border border-border/70 bg-white p-4">
            <QRCode value={url} size={180} />
          </div>
        )}
      </div>
    </Modal>
  );
}
