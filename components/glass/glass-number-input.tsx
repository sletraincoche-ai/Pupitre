"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Input numérique réutilisable — corrige le bug transversal "044" au
// lieu de "44" : un <input type="number"> contrôlé par un state number
// coerce Number("") en 0 dès que le champ est vidé, qui se réaffiche
// aussitôt ("0") ; le navigateur ne repositionne pas forcément le
// curseur après ce zéro fantôme, donc les frappes suivantes s'y
// empilent ("0" + "4" -> "04", + "4" -> "044"). Ce composant garde le
// texte brut tel que tapé dans un state local — jamais recoercé en
// nombre à chaque frappe — et ne remonte/normalise (min/max, zéro de
// tête retiré) qu'au blur ou quand la valeur change depuis l'extérieur.
export function GlassNumberInput({
  value,
  onChange,
  min,
  max,
  step,
  placeholder,
  className,
  disabled,
  title,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number | "any";
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  title?: string;
}) {
  const [texte, setTexte] = useState(String(value));

  // Resynchronise seulement si la valeur vient de l'extérieur (pas de
  // cet input lui-même) — évite d'écraser ce que l'utilisateur est en
  // train de taper.
  useEffect(() => {
    if (Number(texte) !== value) setTexte(String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function gererChangement(e: React.ChangeEvent<HTMLInputElement>) {
    let brut = e.target.value;
    // Retire un zéro de tête dès qu'un autre chiffre suit ("0" + "4" ->
    // "4", jamais "04") — sans jamais recoercer "" en "0" ici, pour ne
    // pas casser la saisie en cours.
    if (/^0\d/.test(brut)) brut = brut.replace(/^0+/, "");
    setTexte(brut);
    if (brut !== "" && brut !== "-" && !Number.isNaN(Number(brut))) onChange(Number(brut));
  }

  function gererFin() {
    let nombre = texte === "" || texte === "-" ? 0 : Number(texte);
    if (Number.isNaN(nombre)) nombre = 0;
    if (min !== undefined) nombre = Math.max(min, nombre);
    if (max !== undefined) nombre = Math.min(max, nombre);
    setTexte(String(nombre));
    onChange(nombre);
  }

  return (
    <input
      type="number"
      inputMode={step === "any" ? "decimal" : "numeric"}
      value={texte}
      onChange={gererChangement}
      onBlur={gererFin}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      disabled={disabled}
      title={title}
      className={cn("h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30", className)}
    />
  );
}
