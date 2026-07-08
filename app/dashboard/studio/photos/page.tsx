"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ImageBank } from "@/components/studio/image-bank";

export default function PhotosPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard/studio" className="flex w-fit items-center gap-1.5 text-sm text-stone hover:text-vine">
        <ArrowLeft className="size-4" />
        Retour au Studio
      </Link>

      <div>
        <h1 className="font-heading text-3xl text-ink lowercase">Banque d&apos;images</h1>
        <p className="mt-1 text-stone">Les photos disponibles pour illustrer vos publications.</p>
      </div>

      <ImageBank />
    </div>
  );
}
