"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type EtapeTutoriel = { selector: string; texte: string };

// Overlay "spotlight" générique et réutilisable — assombrit tout l'écran
// sauf l'élément réel ciblé par chaque étape (retrouvé via un sélecteur
// CSS, pas une ref à faire remonter entre composants distants comme la
// barre d'onglets et le contenu de l'onglet). Portalé (même raison que
// GlassModal : un backdrop-filter ancêtre casserait un position:fixed
// imbriqué).
export function GlassTutorielSpotlight({
  etapes,
  ouvert,
  onFermer,
}: {
  etapes: EtapeTutoriel[];
  ouvert: boolean;
  onFermer: () => void;
}) {
  const [monte, setMonte] = useState(false);
  const [etape, setEtape] = useState(0);
  const [cible, setCible] = useState<DOMRect | null>(null);

  useEffect(() => setMonte(true), []);

  useEffect(() => {
    if (ouvert) setEtape(0);
  }, [ouvert]);

  useEffect(() => {
    if (!ouvert) return;
    function mesurer() {
      const selecteur = etapes[etape]?.selector;
      const el = selecteur ? document.querySelector(selecteur) : null;
      setCible(el ? el.getBoundingClientRect() : null);
    }
    mesurer();
    window.addEventListener("resize", mesurer);
    window.addEventListener("scroll", mesurer, true);
    // Filet de sécurité : la cible peut apparaître après un rendu
    // asynchrone (liste chargée juste après le montage du tutoriel).
    const intervalle = window.setInterval(mesurer, 300);
    return () => {
      window.removeEventListener("resize", mesurer);
      window.removeEventListener("scroll", mesurer, true);
      window.clearInterval(intervalle);
    };
  }, [ouvert, etape, etapes]);

  useEffect(() => {
    if (!ouvert) return;
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") onFermer();
    }
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [ouvert, onFermer]);

  if (!monte || !ouvert || etapes.length === 0) return null;

  const derniere = etape === etapes.length - 1;
  const marge = 8;

  function suivant() {
    if (derniere) onFermer();
    else setEtape((e) => e + 1);
  }

  const largeurBulle = 288;
  let styleBulle: React.CSSProperties;
  if (cible) {
    const placerEnDessous = cible.bottom + 160 <= window.innerHeight;
    const top = placerEnDessous ? cible.bottom + marge + 12 : Math.max(16, cible.top - marge - 12 - 140);
    const left = Math.min(Math.max(cible.left, 16), window.innerWidth - largeurBulle - 16);
    styleBulle = { top, left };
  } else {
    styleBulle = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }

  return createPortal(
    <div className="fixed inset-0 z-[95]">
      <div className="absolute inset-0 bg-ink/78" />
      {cible && (
        <div
          className="pointer-events-none absolute rounded-2xl ring-2 ring-gold/70 transition-all duration-200"
          style={{
            top: cible.top - marge,
            left: cible.left - marge,
            width: cible.width + marge * 2,
            height: cible.height + marge * 2,
            boxShadow: "0 0 0 9999px rgba(6,8,12,0.78)",
          }}
        />
      )}

      <div
        className="absolute flex flex-col gap-3 rounded-2xl border border-white/15 bg-black/60 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl backdrop-saturate-150"
        style={{ ...styleBulle, width: largeurBulle }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium tracking-wide text-white/50 uppercase">
            Étape {etape + 1}/{etapes.length}
          </span>
          <button onClick={onFermer} className="text-[11px] text-white/50 hover:text-white">
            Passer
          </button>
        </div>
        <p className="text-sm text-white">{etapes[etape]?.texte}</p>
        <div className="flex justify-end">
          <button onClick={suivant} className="rounded-full bg-gold px-4 py-1.5 text-xs font-medium text-ink hover:bg-gold/90">
            {derniere ? "Terminer" : "Suivant"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
