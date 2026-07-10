"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";

export type PhotoCompte = { id: string; legende: string; url: string };

type PhotosContextValue = {
  photos: PhotoCompte[];
  hydrated: boolean;
  ajouter: (fichiers: FileList | File[]) => Promise<void>;
  supprimer: (id: string) => Promise<void>;
};

const PhotosContext = createContext<PhotosContextValue | null>(null);

export function PhotosProvider({ children }: { children: ReactNode }) {
  const { user, hydrated: authHydrated } = useAuth();
  const [photos, setPhotos] = useState<PhotoCompte[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!authHydrated) return;
    let annule = false;
    setHydrated(false);
    if (!user) {
      setPhotos([]);
      setHydrated(true);
      return;
    }
    fetch("/api/studio/photos")
      .then((r) => r.json())
      .then((data) => {
        if (!annule) setPhotos(data.photos ?? []);
      })
      .catch(() => {
        if (!annule) setPhotos([]);
      })
      .finally(() => {
        if (!annule) setHydrated(true);
      });
    return () => {
      annule = true;
    };
  }, [user, authHydrated]);

  async function ajouter(fichiers: FileList | File[]) {
    const images = Array.from(fichiers).filter((f) => f.type.startsWith("image/"));
    for (const fichier of images) {
      const form = new FormData();
      form.append("fichier", fichier);
      form.append("legende", fichier.name);
      const res = await fetch("/api/studio/photos", { method: "POST", body: form });
      if (!res.ok) continue;
      const data = await res.json();
      setPhotos((prev) => [data.photo, ...prev]);
    }
  }

  async function supprimer(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/studio/photos?id=${id}`, { method: "DELETE" }).catch(() => {});
  }

  return <PhotosContext.Provider value={{ photos, hydrated, ajouter, supprimer }}>{children}</PhotosContext.Provider>;
}

export function usePhotos() {
  const context = useContext(PhotosContext);
  if (!context) {
    throw new Error("usePhotos doit être utilisé dans un PhotosProvider");
  }
  return context;
}
