"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Interface volontairement brute (hors Liquid Glass) : c'est un formulaire
// de compte, pas une expérience produit. Se connecter à un compte est ce
// qui permet à Studio IA de retrouver vos données d'une session à l'autre.
export function AuthGate() {
  const { connexion, inscription } = useAuth();
  const [mode, setMode] = useState<"connexion" | "inscription">("connexion");
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);
    const action = mode === "connexion" ? connexion : inscription;
    const message = await action(identifiant, motDePasse);
    setEnCours(false);
    if (message) setErreur(message);
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <p className="text-lg font-semibold text-foreground">Se connecter à un compte</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Studio IA garde vos photos, publications et charte narrative rattachées à votre compte.
        </p>

        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="identifiant" className="text-xs font-medium text-muted-foreground">
              Identifiant
            </label>
            <Input
              id="identifiant"
              autoComplete="username"
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              placeholder="ex. domaine-dupont"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="mot-de-passe" className="text-xs font-medium text-muted-foreground">
              Mot de passe
            </label>
            <Input
              id="mot-de-passe"
              type="password"
              autoComplete={mode === "connexion" ? "current-password" : "new-password"}
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>

          {erreur && <p className="text-sm text-destructive">{erreur}</p>}

          <Button type="submit" disabled={enCours} className="mt-1">
            {mode === "connexion" ? "Se connecter" : "Créer mon compte"}
          </Button>
        </form>

        <button
          onClick={() => {
            setErreur(null);
            setMode((m) => (m === "connexion" ? "inscription" : "connexion"));
          }}
          className="mt-4 text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          {mode === "connexion" ? "Pas encore de compte ? Créez-en un." : "Déjà un compte ? Connectez-vous."}
        </button>
      </div>
    </div>
  );
}
