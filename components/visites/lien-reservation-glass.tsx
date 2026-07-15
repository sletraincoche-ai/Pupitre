"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink } from "lucide-react";
import { visitesApi } from "@/lib/visites-api";

export function LienReservationGlass() {
  const [slug, setSlug] = useState<string | null>(null);
  const [saisie, setSaisie] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    visitesApi.parametres().then((r) => {
      setSlug(r.slugPublic);
      setSaisie(r.slugPublic ?? "");
    });
  }, []);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      const { slugPublic } = await visitesApi.enregistrerSlug(saisie);
      setSlug(slugPublic);
      setSaisie(slugPublic);
      toast.success("Lien de réservation enregistré");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de l'enregistrement.");
    } finally {
      setEnvoi(false);
    }
  }

  async function copier() {
    if (!slug) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/reserver/${slug}`);
    } catch {
      // clipboard indisponible — succès visuel quand même
    }
    setCopie(true);
    toast.success("Lien copié");
    setTimeout(() => setCopie(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-white/85">Page de réservation publique</p>
      <p className="text-xs text-white/60">Le lien que vos visiteurs utilisent pour réserver en ligne, sans compte.</p>

      <form onSubmit={enregistrer} className="flex flex-col gap-2 sm:flex-row">
        <div className="flex h-10 flex-1 items-center rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white/50">
          <span className="truncate">pupitre.fr/reserver/</span>
          <input
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            placeholder="mon-domaine"
            className="ml-0.5 min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/30"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={envoi} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/15 disabled:opacity-50">
            {envoi ? "…" : "Enregistrer"}
          </button>
          {slug && (
            <>
              <button type="button" onClick={copier} className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/80 hover:bg-white/15">
                <Copy className="size-3.5" />
                {copie ? "Copié !" : ""}
              </button>
              <a
                href={`/reserver/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/80 hover:bg-white/15"
              >
                <ExternalLink className="size-3.5" />
              </a>
            </>
          )}
        </div>
      </form>
      {erreur && <p className="text-xs text-red-300">{erreur}</p>}
    </div>
  );
}
